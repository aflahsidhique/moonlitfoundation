import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, '../public/instagram');
const catalogPath = path.resolve(here, '../src/data/instagram-reels.json');
const serverEnv = path.resolve(here, '../../server/.env');

export function decodeHtml(value = '') {
  const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (full, entity) => {
    if (entity[0] !== '#') return entities[entity.toLowerCase()] || full;
    const number = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : '';
  });
}

export function canonicalReel(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['www.instagram.com', 'instagram.com'].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/(?:[\w.]+\/)?(?:reel|reels|p)\/([\w-]+)\/?$/);
    if (!match) return null;
    return { id: match[1], url: `https://www.instagram.com/reel/${match[1]}/` };
  } catch { return null; }
}

export function publicReels(html) {
  const decoded = decodeHtml(html.replace(/\\\//g, '/').replace(/\\u002[fF]/g, '/'));
  const ids = [...decoded.matchAll(/(?:https:\/\/(?:www\.)?instagram\.com)?\/(?:[\w.]+\/)?reels?\/([A-Za-z0-9_-]{5,})\//g)].map(match => match[1]);
  return [...new Set(ids)].map(id => ({ id, url: `https://www.instagram.com/reel/${id}/` }));
}

export function readMetadata(html) {
  const values = {};
  for (const tag of html.matchAll(/<meta\s[^>]*>/gi)) {
    const attributes = {};
    for (const attr of tag[0].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attributes[attr[1].toLowerCase()] = decodeHtml(attr[2] ?? attr[3]);
    const key = attributes.property || attributes.name;
    if (key && attributes.content) values[key] = attributes.content;
  }
  return values;
}

export function normalizeApiReels(media) {
  return media.flatMap(item => {
    const reel = canonicalReel(item.permalink);
    if (!reel || item.media_type !== 'VIDEO' || (item.media_product_type !== 'REELS' && !/\/reels?\//.test(item.permalink))) return [];
    return [{ ...reel, caption: item.caption || '', publishedAt: item.timestamp || null, thumbnailSource: item.thumbnail_url || null }];
  });
}

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000), redirect: 'error' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
}

async function apiReels(account) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  const version = process.env.INSTAGRAM_API_VERSION || 'v25.0';
  if (!/^\d+$/.test(userId || '') || !/^v\d+\.\d+$/.test(version)) throw new Error('Set a numeric INSTAGRAM_USER_ID and a valid INSTAGRAM_API_VERSION in server/.env.');
  const headers = { Authorization: `Bearer ${token}` };
  const base = `https://graph.instagram.com/${version}/${userId}`;
  const profile = await (await request(`${base}?fields=username`, { headers })).json();
  if (profile.username?.toLowerCase() !== account.toLowerCase()) throw new Error('The configured Instagram account does not match the website account.');
  const reels = [];
  let after;
  for (let page = 0; page < 4 && reels.length < 12; page++) {
    const url = new URL(`${base}/media`);
    url.searchParams.set('fields', 'id,caption,media_type,media_product_type,permalink,thumbnail_url,timestamp');
    url.searchParams.set('limit', '50');
    if (after) url.searchParams.set('after', after);
    const data = await (await request(url, { headers })).json();
    if (!Array.isArray(data.data)) throw new Error('Instagram returned an invalid media response.');
    reels.push(...normalizeApiReels(data.data));
    after = data.paging?.next && data.paging?.cursors?.after;
    if (!after) break;
  }
  return reels.sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0)).slice(0, 12);
}

async function savePreview(id, source) {
  const url = new URL(source);
  if (url.protocol !== 'https:' || !/(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(url.hostname)) throw new Error('Preview is not hosted by Instagram.');
  const response = await request(url);
  const contentType = response.headers.get('content-type')?.split(';')[0];
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[contentType];
  if (!extension) throw new Error('Preview is not a supported image.');
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > 5 * 1024 * 1024) throw new Error('Preview exceeds 5 MB.');
  const filename = `${id}.${extension}`;
  await fs.writeFile(path.join(outputDir, filename), data);
  return `/instagram/${filename}`;
}

export async function syncInstagram() {
  try { process.loadEnvFile?.(serverEnv); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const saved = JSON.parse((await fs.readFile(catalogPath, 'utf8')).replace(/^\uFEFF/, ''));
  const account = saved.account;
  if (!/^[\w.]+$/.test(account)) throw new Error('Invalid Instagram account name.');
  await fs.mkdir(outputDir, { recursive: true });
  let discovered = [];
  let source = 'saved-links';
  if (process.env.INSTAGRAM_ACCESS_TOKEN) {
    // A failed authenticated sync preserves the existing catalog; it never publishes an empty feed.
    discovered = await apiReels(account);
    source = 'instagram-api';
  } else {
    try {
      const html = await (await request(`https://www.instagram.com/${account}/reels/`)).text();
      discovered = publicReels(html);
      if (discovered.length) source = 'public-profile';
    } catch { console.log('The public profile is unavailable; retaining the saved reel links.'); }
    if (!discovered.length) console.log('Instagram did not expose its reel list publicly. Refreshing saved links; automatic discovery needs an account API token.');
  }
  const previous = new Map(saved.reels.map(reel => [reel.id, reel]));
  const candidates = source === 'instagram-api' ? discovered : [...discovered, ...saved.reels];
  const normalized = candidates.flatMap(reel => {
    const canonical = canonicalReel(reel.url);
    return canonical ? [{ ...reel, ...canonical }] : [];
  });
  const unique = [...new Map(normalized.map(reel => [reel.id, reel])).values()].slice(0, 12);
  if (!unique.length) throw new Error('No reels returned. The existing catalog has been preserved.');
  let previews = 0;
  const reels = [];
  for (const item of unique) {
    const reel = { ...previous.get(item.id), ...item };
    try {
      let image = item.thumbnailSource;
      if (!image) {
        const html = await (await request(reel.url)).text();
        const meta = readMetadata(html);
        if (meta['og:title'] && meta['og:title'] !== 'Instagram') image = meta['og:image'];
      }
      if (image) { reel.thumbnail = await savePreview(item.id, image); previews++; }
    } catch { console.log(`Preview unavailable for ${item.id}; keeping its link and any saved image.`); }
    delete reel.thumbnailSource;
    reels.push(reel);
  }
  const catalog = { account, profileUrl: `https://www.instagram.com/${account}/`, source, updatedAt: new Date().toISOString(), reels };
  const temporary = `${catalogPath}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(catalog, null, 2) + '\n');
  await fs.rename(temporary, catalogPath);
  console.log(`Saved ${reels.length} reels and refreshed ${previews} real preview images. Source: ${source}.`);
  return catalog;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncInstagram().catch(error => { console.error(`Instagram sync stopped: ${error.message}. Existing reels were kept.`); process.exitCode = 1; });
}
