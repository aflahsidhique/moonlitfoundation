import WebsiteImageField from "./WebsiteImageField";

const MONTHS=["No month","January","February","March","April","May","June","July","August","September","October","November","December"];
const number=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const byDate=(left,right)=>number(left.year)-number(right.year)||number(left.month)-number(right.month)||number(left.order,1)-number(right.order,1)||String(left.title).localeCompare(String(right.title));
const newId=()=>globalThis.crypto?.randomUUID?.()||`journey-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function JourneyTimelineField({field,value,onChange,disabled,onBusy}) {
  const milestones=Array.isArray(value)?value:[];
  const ordered=[...milestones].sort(byDate);
  const update=(id,changes)=>onChange(milestones.map(item=>item.id===id?{...item,...changes}:item));
  function addMilestone() {
    const year=new Date().getFullYear(),month="";
    const order=Math.max(0,...milestones.filter(item=>number(item.year)===year&&number(item.month)===0).map(item=>number(item.order)))+1;
    onChange([...milestones,{id:newId(),year,month,order,title:"",text:"",image:""}]);
  }
  function removeMilestone(item) {
    if(window.confirm(`Remove ${item.title||"this milestone"} from the journey?`))onChange(milestones.filter(current=>current.id!==item.id));
  }
  return <div className="cms-team-editor cms-journey-editor">
    <div className="cms-team-toolbar"><div><p>Build the journey one milestone at a time.</p><small>Milestones are automatically displayed from the earliest year and month to the latest. Order resolves milestones with the same date.</small></div><button type="button" className="mf-btn mf-btn-primary" onClick={addMilestone} disabled={disabled||milestones.length>=(field.maxItems||100)}><i className="fa-solid fa-plus" aria-hidden="true"/> Add milestone</button></div>
    {!ordered.length&&<p className="ws-empty">No milestones yet. Select Add milestone to create the first timeline card.</p>}
    <div className="cms-team-grid">{ordered.map((item,index)=><section className="cms-team-card cms-journey-card" key={item.id}>
      <header><div><span>Milestone {index+1}</span><h4>{item.title||"New milestone"}</h4></div><button type="button" className="mf-admin-btn mf-admin-btn-neutral" onClick={()=>removeMilestone(item)} disabled={disabled} aria-label={`Remove ${item.title||"milestone"}`}><i className="fa-solid fa-trash" aria-hidden="true"/> Remove</button></header>
      <div className="cms-team-card-fields cms-journey-card-fields">
        <label className="cms-field"><span className="mf-label">Year</span><input className="mf-input" required type="number" min={1900} max={2200} step={1} value={item.year??""} onChange={event=>update(item.id,{year:event.target.value===""?"":Number(event.target.value)})}/></label>
        <label className="cms-field"><span className="mf-label">Month (optional)</span><select className="mf-input" value={item.month??""} onChange={event=>update(item.id,{month:event.target.value===""?"":Number(event.target.value)})}>{MONTHS.map((month,index)=><option key={month} value={index||""}>{month}</option>)}</select></label>
        <label className="cms-field"><span className="mf-label">Order within the same date</span><input className="mf-input" required type="number" min={1} max={50} step={1} value={item.order??""} onChange={event=>update(item.id,{order:event.target.value===""?"":Number(event.target.value)})}/></label>
        <label className="cms-field"><span className="mf-label">Title</span><input className="mf-input" required maxLength={150} value={item.title??""} onChange={event=>update(item.id,{title:event.target.value})}/></label>
        <label className="cms-field cms-field-wide"><span className="mf-label">Description</span><textarea className="mf-input" required rows={4} maxLength={2000} value={item.text??""} onChange={event=>update(item.id,{text:event.target.value})}/></label>
      </div>
      <div className="cms-team-photo"><span className="mf-label">Timeline image</span><WebsiteImageField field={{...field,key:`${field.key}-${item.id}`,label:`image for ${item.title||"milestone"}`}} value={item.image} onChange={image=>update(item.id,{image})} disabled={disabled} onBusy={onBusy}/></div>
    </section>)}</div>
  </div>;
}
