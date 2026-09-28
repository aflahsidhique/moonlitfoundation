const { createHash } = require("node:crypto");
const schema = require("../content/schema.json");
const defaults = (page) => Object.fromEntries(page.fields.map((field) => [field.key, field.default]));
const categories = ["blood", "welfare", "relief", "environment", "youth"];
const bad = (message, status = 400) => Object.assign(new Error(message), { status });
const revision = (value) => { if (!Number.isSafeInteger(value) || value < 0) throw bad("A valid revision is required. Reload and try again."); return value; };
function safeUrl(value, image = false) {
  if (typeof value !== "string" || /[\s\\\u0000-\u001f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return !value.includes("..");
  try { const url = new URL(value); return !url.username && !url.password && (url.protocol === "https:" || (!image && ["mailto:", "tel:"].includes(url.protocol))); } catch { return false; }
}
function validateContent(page, values) {
  if (!values || typeof values !== "object" || Array.isArray(values)) throw bad("Content must be a set of fields.");
  const allowed = new Map(page.fields.map(f => [f.key, f]));
  const result = {};
  for (const [key, value] of Object.entries(values)) {
    const field = allowed.get(key);
    if (!field) throw bad("This page contains an unknown field. Reload the editor.");
    if (field.type === "number") {
      if (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000) throw bad(`${field.label}: enter a whole number between 0 and 1 billion.`);
    } else {
      if (typeof value !== "string" || value.length > field.maxLength || value.includes("\u0000")) throw bad(`${field.label}: the value is too long or invalid.`);
      if (["url", "image"].includes(field.type) && !safeUrl(value, field.type === "image")) throw bad(`${field.label}: use a secure URL or a local website path.`);
    }
    result[key] = value;
  }
  return { ...defaults(page), ...result };
}
function imageFields(body, partial = false) {
  const data = {};
  for (const [name, max] of [["title",150],["alt",300],["caption",1000]]) {
    if (partial && body[name] === undefined) continue;
    const value = body[name];
    if (typeof value !== "string" || value.length > max || (name !== "caption" && !value.trim())) throw bad(`${name}: enter ${name === "caption" ? "up to" : "1–"}${max} characters.`);
    data[name] = value.trim();
  }
  if (!partial || body.category !== undefined) {
    if (!categories.includes(body.category)) throw bad("Choose a valid gallery category.");
    data.category = body.category;
  }
  if (body.status !== undefined) {
    if (!["draft","published"].includes(body.status)) throw bad("Choose draft or published.");
    data.status = body.status;
  }
  if (body.sortOrder !== undefined) {
    if (!Number.isInteger(body.sortOrder) || body.sortOrder < 0 || body.sortOrder > 100000) throw bad("Order must be a whole number between 0 and 100000.");
    data.sortOrder = body.sortOrder;
  }
  return data;
}
function createSnapshotCache(prisma) {
  let cached, pending, generation = 0;
  function invalidate() { generation++; cached = null; pending = null; }
  async function get() {
    if (cached && Date.now() - cached.at < 30_000) return cached;
    if (pending) return pending.promise;
    const entry = { generation };
    entry.promise = Promise.all([
      prisma.websiteContent.findMany({ select: { published: true } }),
      prisma.websiteImage.findMany({ where: { inGallery: true, status: "published", deletedAt: null }, orderBy: [{sortOrder:"asc"},{createdAt:"desc"}], select: {id:true,imageUrl:true,title:true,alt:true,caption:true,category:true,width:true,height:true} }),
    ]).then(([pages, gallery]) => {
      const body = { version: schema.version, content: Object.assign({}, ...schema.pages.map(defaults), ...pages.map(p=>p.published)), gallery };
      const result = { body, etag: '"' + createHash("sha256").update(JSON.stringify(body)).digest("hex") + '"', at: Date.now() };
      if (generation === entry.generation) cached = result;
      return result;
    }).finally(()=>{if(pending === entry) pending = null;});
    pending = entry;
    return entry.promise;
  }
  return { get, invalidate };
}
module.exports = { schema, defaults, categories, bad, revision, validateContent, imageFields, createSnapshotCache };
