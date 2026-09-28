import { useState } from "react";
import { adminFetch } from "../lib/adminApi";
import AdminModal from "./AdminModal";

import { uploadWebsiteImage } from "../lib/websiteImages";

export default function WebsiteImageField({field,value,onChange,disabled,onBusy}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[library,setLibrary]=useState(null);
  async function upload(file) {
    setError("");setBusy(true);onBusy(true);
    try { const {image}=await uploadWebsiteImage(file);onChange(image.imageUrl); }
    catch(err){setError(err.message);}finally{setBusy(false);onBusy(false);}
  }
  async function openLibrary() {
    setError("");setLibrary([]);
    try {const result=await adminFetch("/website/images");setLibrary(result.images||[]);}
    catch(err){setError(err.message);setLibrary(null);}
  }
  return <div className="cms-image-field">
    <img src={value} alt="Current website image" loading="lazy" />
    <div><label className="mf-admin-btn mf-admin-btn-neutral cms-upload-label">{busy?"Converting & uploading…":"Upload replacement"}<input aria-label={`Upload ${field.label}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||busy} onChange={event=>{const file=event.target.files[0];event.target.value="";if(file)upload(file);}} /></label><button type="button" className="mf-admin-btn mf-admin-btn-neutral" disabled={disabled||busy} onClick={openLibrary}>Choose from library</button><small>JPG, PNG or WebP · up to 5 MB. Stored as WebP.</small>{error&&<p role="alert" className="ws-error">{error}</p>}</div>
    <AdminModal open={library!==null} onClose={()=>setLibrary(null)} title="Choose a website image" wide><div className="cms-library">{library?.map(image=><button type="button" key={image.id} onClick={()=>{onChange(image.imageUrl);setLibrary(null);}}><img src={image.imageUrl} alt={image.alt} loading="lazy"/><span>{image.title}</span></button>)}</div>{!library?.length&&<p className="ws-empty">Upload a photo to start your image library.</p>}</AdminModal>
  </div>;
}
