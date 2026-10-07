const { createHash } = require("node:crypto");
const schema = require("../content/schema.json");
const defaults = (page) => Object.fromEntries(page.fields.map((field) => [field.key, field.type === "image" ? "" : field.default]));
const categories = ["blood", "welfare", "relief", "environment", "youth"];
const bad = (message, status = 400) => Object.assign(new Error(message), { status });
const revision = (value) => { if (!Number.isSafeInteger(value) || value < 0) throw bad("A valid revision is required. Reload and try again."); return value; };
function safeUrl(value, image = false) {
  if (typeof value !== "string" || /[\s\\\u0000-\u001f]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return !value.includes("..");
  try { const url = new URL(value); return !url.username && !url.password && (url.protocol === "https:" || (!image && ["mailto:", "tel:"].includes(url.protocol))); } catch { return false; }
}

function isWebsiteImage(value) {
  if (value === "") return true;
  try {
    const url = new URL(value);
    return !url.username && !url.password && url.protocol === "https:";
  } catch { return false; }
}
function cleanTeam(value) {
  if (!Array.isArray(value)) return undefined;
  return value.filter(member => member && typeof member === "object" && !Array.isArray(member)).map(member => ({
    id: typeof member.id === "string" ? member.id : "",
    name: typeof member.name === "string" ? member.name : "",
    role: typeof member.role === "string" ? member.role : "",
    image: isWebsiteImage(member.image) ? member.image : "",
    row: member.row,
    order: member.order,
  }));
}
function cleanTimeline(value) {
  if (!Array.isArray(value)) return undefined;
  return value.filter(item => item && typeof item === "object" && !Array.isArray(item)).map(item => ({
    id: typeof item.id === "string" ? item.id : "",
    year: item.year,
    month: item.month,
    order: item.order,
    title: typeof item.title === "string" ? item.title : "",
    text: typeof item.text === "string" ? item.text : "",
    image: isWebsiteImage(item.image) ? item.image : "",
  }));
}
function cleanContent(page, values = {}) {
  if (!page) return {};
  const fields = new Map(page.fields.map(field => [field.key, field]));
  return Object.fromEntries(Object.entries(values).flatMap(([key, value]) => {
    const field=fields.get(key);
    if (!field) return [];
    if (field.type === "image") return [[key,isWebsiteImage(value)?value:""]];
    if (field.type === "team") { const team=cleanTeam(value);return team ? [[key,team]] : []; }
    if (field.type === "timeline") { const timeline=cleanTimeline(value);return timeline ? [[key,timeline]] : []; }
    return [[key,value]];
  }));
}
function validateContent(page, values) {
  if (!values || typeof values !== "object" || Array.isArray(values)) throw bad("Content must be a set of fields.");
  const allowed = new Map(page.fields.map(f => [f.key, f]));
  const result = {};
  for (const [key, value] of Object.entries(values)) {
    const field = allowed.get(key);
    if (!field) throw bad("This page contains an unknown field. Reload the editor.");
    if (field.type === "team") {
      if (!Array.isArray(value) || value.length > (field.maxItems || 100)) throw bad(`${field.label}: add no more than ${field.maxItems || 100} people.`);
      const ids=new Set(),positions=new Set();
      result[key]=value.map((member,index)=>{
        if (!member || typeof member !== "object" || Array.isArray(member)) throw bad(`${field.label}: person ${index+1} is invalid.`);
        const {id,name,role,image,row,order}=member;
        if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || ids.has(id)) throw bad(`${field.label}: person ${index+1} has an invalid identifier.`);
        if (typeof name !== "string" || !name.trim() || name.length > 150 || name.includes("\u0000")) throw bad(`${field.label}: enter a name of up to 150 characters for person ${index+1}.`);
        if (typeof role !== "string" || !role.trim() || role.length > 150 || role.includes("\u0000")) throw bad(`${field.label}: enter a role of up to 150 characters for person ${index+1}.`);
        if (!isWebsiteImage(image)) throw bad(`${field.label}: upload an image or enter a complete HTTPS image URL for ${name.trim()}.`);
        if (!Number.isSafeInteger(row) || row < 1 || row > 50 || !Number.isSafeInteger(order) || order < 1 || order > 50) throw bad(`${field.label}: row and position must be whole numbers from 1 to 50.`);
        const position=`${row}:${order}`;
        if (positions.has(position)) throw bad(`${field.label}: two people cannot use row ${row}, position ${order}.`);
        ids.add(id);positions.add(position);
        return {id,name:name.trim(),role:role.trim(),image,row,order};
      });
      continue;
    }
    if (field.type === "timeline") {
      if (!Array.isArray(value) || value.length > (field.maxItems || 100)) throw bad(`${field.label}: add no more than ${field.maxItems || 100} milestones.`);
      const ids=new Set(),positions=new Set();
      result[key]=value.map((item,index)=>{
        if (!item || typeof item !== "object" || Array.isArray(item)) throw bad(`${field.label}: milestone ${index+1} is invalid.`);
        const {id,year,month,order,title,text,image}=item;
        if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id) || ids.has(id)) throw bad(`${field.label}: milestone ${index+1} has an invalid identifier.`);
        if (!Number.isSafeInteger(year) || year < 1900 || year > 2200) throw bad(`${field.label}: enter a year from 1900 to 2200 for milestone ${index+1}.`);
        if (month !== "" && (!Number.isSafeInteger(month) || month < 1 || month > 12)) throw bad(`${field.label}: choose a valid month for milestone ${index+1}.`);
        if (!Number.isSafeInteger(order) || order < 1 || order > 50) throw bad(`${field.label}: order must be a whole number from 1 to 50.`);
        if (typeof title !== "string" || !title.trim() || title.length > 150 || title.includes("\u0000")) throw bad(`${field.label}: enter a title of up to 150 characters for milestone ${index+1}.`);
        if (typeof text !== "string" || !text.trim() || text.length > 2000 || text.includes("\u0000")) throw bad(`${field.label}: enter a description of up to 2000 characters for ${title.trim()}.`);
        if (!isWebsiteImage(image)) throw bad(`${field.label}: upload an image or enter a complete HTTPS image URL for ${title.trim()}.`);
        const position=`${year}:${month||0}:${order}`;
        if (positions.has(position)) throw bad(`${field.label}: two milestones cannot use the same year, month, and order.`);
        ids.add(id);positions.add(position);
        return {id,year,month,order,title:title.trim(),text:text.trim(),image};
      });
      continue;
    }
    if (field.type === "number") {
      if (!Number.isSafeInteger(value) || value < 0 || value > 1_000_000_000) throw bad(`${field.label}: enter a whole number between 0 and 1 billion.`);
    } else {
      if (typeof value !== "string" || value.length > field.maxLength || value.includes("\u0000")) throw bad(`${field.label}: the value is too long or invalid.`);
      if (field.type === "image" && !isWebsiteImage(value)) throw bad(`${field.label}: upload an image or enter a complete HTTPS image URL.`);
      if (field.type === "url" && !safeUrl(value)) throw bad(`${field.label}: use a secure URL or a local website path.`);
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
      prisma.websiteContent.findMany({ select: { id: true, published: true } }),
      prisma.websiteImage.findMany({ where: { inGallery: true, status: "published", deletedAt: null, publicId: { not: null } }, orderBy: [{sortOrder:"asc"},{createdAt:"desc"}], select: {id:true,imageUrl:true,title:true,alt:true,caption:true,category:true,width:true,height:true} }),
    ]).then(([pages, gallery]) => {
      const body = { version: schema.version, content: Object.assign({}, ...schema.pages.map(defaults), ...pages.map(row=>cleanContent(schema.pages.find(page=>page.id===row.id),row.published))), gallery };
      const result = { body, etag: '"' + createHash("sha256").update(JSON.stringify(body)).digest("hex") + '"', at: Date.now() };
      if (generation === entry.generation) cached = result;
      return result;
    }).finally(()=>{if(pending === entry) pending = null;});
    pending = entry;
    return entry.promise;
  }
  return { get, invalidate };
}
module.exports = { schema, defaults, categories, bad, revision, validateContent, imageFields, cleanContent, createSnapshotCache };
