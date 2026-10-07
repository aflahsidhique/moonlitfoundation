import { useState } from "react";
import { adminFetch } from "../lib/adminApi";
import AdminModal from "./AdminModal";

import { uploadWebsiteImage } from "../lib/websiteImages";

export default function WebsiteImageField({field,value,onChange,disabled,onBusy}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[library,setLibrary]=useState(null),[showUrl,setShowUrl]=useState(false),[url,setUrl]=useState("");
  async function upload(file) {
    setError("");setBusy(true);onBusy(true);
    try { const {image}=await uploadWebsiteImage(file);onChange(image.imageUrl); }
    catch(err){setError(err.message);}finally{setBusy(false);onBusy(false);}
  }
  async function openLibrary() {
    setError("");setBusy(true);setLibrary({images:[],pagination:null,loading:true});
    try {const result=await adminFetch("/website/images?filter=library&page=1&pageSize=24");setLibrary({images:result.images||[],pagination:result.pagination,loading:false});}
    catch(err){setError(err.message);setLibrary(null);}finally{setBusy(false);}
  }
  async function loadMore() {
    if(!library?.pagination?.hasNext)return;
    setBusy(true);
    try {const next=library.pagination.page+1;const result=await adminFetch(`/website/images?filter=library&page=${next}&pageSize=24`);setLibrary(current=>({images:[...current.images,...(result.images||[])],pagination:result.pagination}));}
    catch(err){setError(err.message);}finally{setBusy(false);}
  }
  function openUrl() { setError("");setUrl(value||"");setShowUrl(true); }
  function applyUrl() {
    const next=url.trim();
    if(next) {
      try { const parsed=new URL(next);if(parsed.protocol!=="https:"||parsed.username||parsed.password)throw new Error(); }
      catch { setError("Enter a complete HTTPS image URL.");return; }
    }
    onChange(next);setShowUrl(false);setError("");
  }
  return <div className="cms-image-field">
    {value&&<img src={value} alt="Current website image" loading="lazy" />}
    <div><label className="mf-admin-btn mf-admin-btn-neutral cms-upload-label">{busy?"Converting & uploading…":value?"Upload replacement":"Upload image"}<input aria-label={`Upload ${field.label}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||busy} onChange={event=>{const file=event.target.files[0];event.target.value="";if(file)upload(file);}} /></label><button type="button" className="mf-admin-btn mf-admin-btn-neutral" disabled={disabled||busy} onClick={openLibrary}>Choose from library</button><button type="button" className="mf-admin-btn mf-admin-btn-neutral" disabled={disabled||busy} onClick={openUrl}>Use image URL</button>{value&&<button type="button" className="mf-admin-btn mf-admin-btn-neutral" disabled={disabled||busy} onClick={()=>{onChange("");setUrl("");}}>Remove image</button>}{showUrl&&<div className="cms-image-url"><label className="sr-only" htmlFor={`${field.key}-url`}>Image URL</label><input id={`${field.key}-url`} className="mf-input" type="url" inputMode="url" placeholder="https://example.com/photo.jpg" value={url} onChange={event=>setUrl(event.target.value)} disabled={disabled||busy}/><button type="button" className="mf-admin-btn mf-admin-btn-neutral" onClick={applyUrl} disabled={disabled||busy}>Apply URL</button><button type="button" className="mf-admin-btn mf-admin-btn-neutral" onClick={()=>setShowUrl(false)} disabled={disabled||busy}>Cancel</button></div>}<small>Upload JPG, PNG or WebP up to 5 MB, choose from the library, or use a direct HTTPS image URL.</small>{error&&<p role="alert" className="ws-error">{error}</p>}</div>
    <AdminModal open={library!==null} onClose={()=>setLibrary(null)} title="Choose a website image" wide busy={busy}><div className="cms-library">{library?.images.map(image=><button type="button" key={image.id} onClick={()=>{onChange(image.imageUrl);setLibrary(null);}}><img src={image.imageUrl} alt={image.alt} loading="lazy"/><span>{image.title}</span></button>)}</div>{library?.loading?<p className="ws-empty" role="status">Loading image library…</p>:!library?.images.length&&<p className="ws-empty">Upload a photo to start your image library.</p>}{library?.pagination?.hasNext&&<div className="flex justify-center mt-4"><button type="button" className="mf-btn mf-btn-outline" onClick={loadMore} disabled={busy}>{busy?"Loading…":"Load more images"}</button></div>}</AdminModal>
  </div>;
}
