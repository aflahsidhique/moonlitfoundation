const router = require("express").Router();
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { upload, storeWebp } = require("../lib/upload");
const { convertToWebp } = require("../lib/webp");
const { schema, defaults, categories, bad, revision, validateContent, imageFields, createSnapshotCache } = require("../lib/website");
const snapshots = createSnapshotCache(prisma);
const wrap = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(error => {
  if (error.code === "P2002" || error.code === "P2025") error = bad("This item changed in another session. Reload before saving again.",409);
  if (error.status) return res.status(error.status).json({error:error.message});
  console.error("Website management request failed:", error.message);
  res.status(500).json({error:"Website management is unavailable. Please try again."});
});
const pageFor = (id) => { const page = schema.pages.find(p=>p.id===id); if(!page) throw bad("Page not found.",404); return page; };
const viewPage = (page,row) => ({ id:page.id, draft:{...defaults(page),...row?.draft}, published:{...defaults(page),...row?.published}, revision:row?.revision||0, publishedRevision:row?.publishedRevision||0, publishedAt:row?.publishedAt||null });

router.get("/",wrap(async(req,res)=>{
  const snapshot=await snapshots.get();
  // Browser code controls freshness. HTTP must revalidate once its local TTL expires.
  res.set({"Cache-Control":"public, max-age=0, must-revalidate", ETag:snapshot.etag});
  if (req.headers["if-none-match"]?.split(/\s*,\s*/).includes(snapshot.etag)) return res.status(304).end();
  res.json(snapshot.body);
}));
router.use(requireAuth);
router.get("/admin",wrap(async(req,res)=>{
  const rows=await prisma.websiteContent.findMany();
  res.json({schema,pages:schema.pages.map(p=>viewPage(p,rows.find(r=>r.id===p.id))),categories});
}));
router.put("/pages/:id",wrap(async(req,res)=>{
  const page=pageFor(req.params.id), expected=revision(req.body.revision), draft=validateContent(page,req.body.content);
  const row=await prisma.$transaction(async tx=>{
    if(expected===0) return tx.websiteContent.create({data:{id:page.id,draft,published:{},revision:1}});
    const updated=await tx.websiteContent.updateMany({where:{id:page.id,revision:expected},data:{draft,revision:{increment:1}}});
    if(!updated.count) throw bad("This page changed in another session. Reload before saving again.",409);
    return tx.websiteContent.findUnique({where:{id:page.id}});
  });
  res.json(viewPage(page,row));
}));
router.post("/pages/:id/publish",wrap(async(req,res)=>{
  const page=pageFor(req.params.id), expected=revision(req.body.revision);
  const row=await prisma.$transaction(async tx=>{
    const current=await tx.websiteContent.findUnique({where:{id:page.id}});
    if(!current || current.revision!==expected) throw bad("Save your draft or reload the latest page before publishing.",409);
    const updated=await tx.websiteContent.updateMany({where:{id:page.id,revision:expected},data:{published:current.draft,publishedAt:new Date(),revision:{increment:1},publishedRevision:expected+1}});
    if(!updated.count) throw bad("This page changed in another session. Reload before publishing.",409);
    return tx.websiteContent.findUnique({where:{id:page.id}});
  });
  snapshots.invalidate();
  res.json(viewPage(page,row));
}));

router.get("/images",wrap(async(req,res)=>{
  const images=await prisma.websiteImage.findMany({where:{deletedAt:null},orderBy:[{sortOrder:"asc"},{createdAt:"desc"}]});
  res.json({images,categories});
}));
function parseImage(req,res,next) {
  upload.single("image")(req,res,error=>{
    if(error) return res.status(error.code==="LIMIT_FILE_SIZE"?413:400).json({error:error.code==="LIMIT_FILE_SIZE"?"Images must be 5 MB or smaller.":error.message});
    next();
  });
}
router.post("/images",parseImage,wrap(async(req,res)=>{
  if(!req.file) throw bad("Choose an image to upload.");
  const data=imageFields({...req.body,caption:req.body.caption||"",category:req.body.category||"welfare",...(req.body.sortOrder!==undefined&&{sortOrder:Number(req.body.sortOrder)})});
  const inGallery=req.body.inGallery==="true";
  const converted=await convertToWebp(req.file.buffer);
  const existing=await prisma.websiteImage.findUnique({where:{contentHash:converted.hash}});
  if(existing) {
    // Reusing the same bytes avoids another Cloudinary upload. Never overwrite an existing caption.
    const image = (existing.deletedAt || (inGallery&&!existing.inGallery)) ? await prisma.websiteImage.update({where:{id:existing.id},data:{deletedAt:null,inGallery:inGallery||existing.inGallery,status:"draft",revision:{increment:1}}}) : existing;
    snapshots.invalidate();
    return res.json({image,deduplicated:true});
  }
  if(!["CLOUDINARY_CLOUD_NAME","CLOUDINARY_API_KEY","CLOUDINARY_API_SECRET"].every(key=>process.env[key]&&!/^(your_|replace|example)/i.test(process.env[key]))) throw bad("Configure Cloudinary on the server to enable uploads.",503);
  let stored;
  try { stored=await storeWebp(converted,"moonlit/website",{public_id:converted.hash}); }
  catch { throw bad("Image storage is unavailable. Your image was not saved; please retry.",502); }
  // A deterministic ID and unique hash deduplicate simultaneous uploads too.
  const image=await prisma.websiteImage.upsert({where:{contentHash:converted.hash},update:{},create:{...data,status:"draft",inGallery,publicId:stored.public_id,imageUrl:stored.secure_url,contentHash:converted.hash,width:converted.width,height:converted.height,bytes:converted.bytes,format:"webp"}});
  res.status(201).json({image});
}));
router.patch("/images/:id",wrap(async(req,res)=>{
  const expected=revision(req.body.revision), data=imageFields(req.body,true);
  if(req.body.inGallery!==undefined) { if(typeof req.body.inGallery!=="boolean") throw bad("Invalid gallery selection."); data.inGallery=req.body.inGallery; }
  const image=await prisma.$transaction(async tx=>{
    const updated=await tx.websiteImage.updateMany({where:{id:req.params.id,revision:expected,deletedAt:null},data:{...data,revision:{increment:1}}});
    if(!updated.count) throw bad("This photo was changed or removed. Reload before saving again.",409);
    return tx.websiteImage.findUnique({where:{id:req.params.id}});
  });
  snapshots.invalidate();res.json({image});
}));
router.delete("/images/:id",wrap(async(req,res)=>{
  const expected=revision(req.body.revision);
  const result=await prisma.websiteImage.updateMany({where:{id:req.params.id,revision:expected,deletedAt:null},data:{deletedAt:new Date(),status:"draft",inGallery:false,revision:{increment:1}}});
  if(!result.count) throw bad("This photo was changed or removed. Reload before trying again.",409);
  // Keep the underlying asset: it may still be used by a published page or an open draft.
  snapshots.invalidate();res.json({ok:true});
}));
module.exports=router;
