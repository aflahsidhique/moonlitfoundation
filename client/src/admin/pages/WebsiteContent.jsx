import { useEffect, useMemo, useRef, useState } from "react";
import { adminFetch } from "../lib/adminApi";
import { invalidateWebsite } from "../../lib/websiteCache";
import { useToast } from "../../hooks/useToast";
import WebsiteImageField from "../components/WebsiteImageField";
import TeamMembersField from "../components/TeamMembersField";
import JourneyTimelineField from "../components/JourneyTimelineField";
import "../../styles/content-management.css";

function PageEditor({page,row,onSaved,onDirty}) {
  const [values,setValues]=useState(row.draft),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[error,setError]=useState(""),[query,setQuery]=useState("");
  const toast=useToast();
  const dirty=JSON.stringify(values)!==JSON.stringify(row.draft);
  useEffect(()=>{onDirty(dirty);return()=>onDirty(false);},[dirty,onDirty]);
  const groups=useMemo(()=>Object.entries(Object.groupBy(page.fields.filter(f=>`${f.label} ${f.group}`.toLowerCase().includes(query.toLowerCase())),f=>f.group)),[page,query]);
  useEffect(()=>{
    if(!dirty)return;
    const warn=event=>{event.preventDefault();event.returnValue="";};
    const navigate=event=>{const link=event.target.closest?.("a[href]");if(!link||link.target==="_blank"||event.ctrlKey||event.metaKey)return;const url=new URL(link.href);if(url.pathname===location.pathname)return;if(!window.confirm("Leave this page and discard unsaved edits?")){event.preventDefault();event.stopPropagation();}};
    window.addEventListener("beforeunload",warn);document.addEventListener("click",navigate,true);return()=>{window.removeEventListener("beforeunload",warn);document.removeEventListener("click",navigate,true);};
  },[dirty]);
  async function save(publish) {
    setBusy(true);setError("");
    try {
      let saved=row;
      if(dirty||!row.revision) saved=await adminFetch(`/website/pages/${page.id}`,{method:"PUT",body:JSON.stringify({revision:row.revision,content:values})});
      onSaved(saved);
      if(publish) {
        saved=await adminFetch(`/website/pages/${page.id}/publish`,{method:"POST",body:JSON.stringify({revision:saved.revision})});
        onSaved(saved);invalidateWebsite();
      }
      toast(publish?`${page.label} is now live.`:"Draft saved. Publish when you’re ready.");
    }catch(err){setError(err.message);}finally{setBusy(false);}
  }
  return <form className="cms-editor" onSubmit={event=>{event.preventDefault();save(false);}}>
    <div className="cms-editor-header"><div><p className="ws-eyebrow">{row.publishedAt?"Published page":"Original website content"}</p><h2>{page.label}</h2><p>{dirty?"You have unsaved changes.":row.revision!==row.publishedRevision?"Draft changes are ready to publish.":"Your published content is up to date."}</p></div><a href={page.path} target="_blank" rel="noopener noreferrer" className="mf-admin-btn mf-admin-btn-neutral">View live page <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"/></a></div>
    <div className="cms-editor-actions"><input className="mf-input" type="search" aria-label="Find a content field" placeholder="Find a heading, section or image…" value={query} onChange={e=>setQuery(e.target.value)}/><button className="mf-btn mf-btn-outline" disabled={busy||uploading||!dirty&&row.revision>0} type="submit">{busy?"Saving…":"Save draft"}</button><button className="mf-btn mf-btn-primary" type="button" disabled={busy||uploading||!dirty&&row.revision===row.publishedRevision&&row.revision>0} onClick={event=>{if(event.currentTarget.form.reportValidity())save(true);}}>Publish page</button></div>
    {error&&<p role="alert" className="ws-error">{error} Your changes are still in the editor.</p>}
    <fieldset disabled={busy||uploading} className="cms-fields">{groups.map(([group,fields],index)=>{const collectionField=fields.find(field=>["team","timeline"].includes(field.type));const count=collectionField?(values[collectionField.key]||[]).length:null;return <details key={group} open={query?true:undefined} className="cms-group" name={query?undefined:`${page.id}-sections`} {...(!query&&index===0?{open:true}:{})}><summary><span>{group.replaceAll("-"," ").replace(/\b\w/g,c=>c.toUpperCase())}</span><small>{collectionField?`${count} ${collectionField.type==="team"?"people":"milestones"}`:`${fields.length} fields`}</small></summary><div className="cms-field-grid">{fields.map(field=><div className={`cms-field cms-field-${field.type}`} key={field.key}>{field.type==="team"?<TeamMembersField field={field} value={values[field.key]} onChange={value=>setValues(v=>({...v,[field.key]:value}))} disabled={busy} onBusy={setUploading}/>:field.type==="timeline"?<JourneyTimelineField field={field} value={values[field.key]} onChange={value=>setValues(v=>({...v,[field.key]:value}))} disabled={busy} onBusy={setUploading}/>:<><label className="mf-label" htmlFor={field.key}>{field.label}</label>{field.type==="image"?<WebsiteImageField field={field} value={values[field.key]} onChange={value=>setValues(v=>({...v,[field.key]:value}))} disabled={busy} onBusy={setUploading}/>:field.type==="textarea"?<textarea id={field.key} className="mf-input" rows={4} maxLength={field.maxLength} value={values[field.key]??""} onChange={e=>setValues(v=>({...v,[field.key]:e.target.value}))}/>:<input id={field.key} className="mf-input" type={field.type==="number"?"number":"text"} min={field.type==="number"?0:undefined} max={field.type==="number"?1000000000:undefined} step={field.type==="number"?1:undefined} maxLength={field.maxLength} value={values[field.key]??""} onChange={e=>setValues(v=>({...v,[field.key]:field.type==="number"?Number(e.target.value):e.target.value}))}/>}</>}</div>)}</div></details>;})}</fieldset>
    {!groups.length&&<p className="ws-empty">No fields match your search.</p>}
    <p className="cms-help">Save keeps your edits private. Publish page makes the saved content visible on the website. Other visitors refresh within five minutes.</p>
  </form>;
}
export default function WebsiteContent() {
  const dirty=useRef(false);
  const [data,setData]=useState(null),[selected,setSelected]=useState("home"),[error,setError]=useState("");
  async function load(){setError("");try{const next=await adminFetch("/website/admin",{force:true});if(!next.schema?.pages)throw new Error("The content editor is unavailable. Check that the latest server migration is installed.");setData(next);}catch(err){setError(err.message);}}
  useEffect(()=>{load();},[]);
  const page=data?.schema.pages.find(p=>p.id===selected),row=data?.pages.find(p=>p.id===selected);
  return <><div className="cms-intro"><span className="cms-intro-icon"><i className="fa-solid fa-pen-to-square" aria-hidden="true"/></span><div><h2>Your story, in your words.</h2><p>Update the website’s copy, photos and impact figures. Save a draft, then publish it when it’s ready.</p></div></div>{error&&<div className="ws-error" role="alert">{error} <button className="mf-admin-btn" onClick={load}>Retry</button></div>}{!data&&!error?<p className="ws-empty" role="status">Loading website content…</p>:data&&<><div className="cms-page-picker"><label className="mf-label" htmlFor="cms-page">Choose a page</label><select id="cms-page" className="mf-input" value={selected} onChange={e=>{if(dirty.current&&!window.confirm("Leave this page and discard unsaved edits?"))return;setSelected(e.target.value);}}>{data.schema.pages.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></div>{page&&row&&<PageEditor key={selected} page={page} row={row} onDirty={value=>{dirty.current=value;}} onSaved={saved=>setData(current=>({...current,pages:current.pages.map(p=>p.id===saved.id?saved:p)}))}/>}</>}</>;
}
