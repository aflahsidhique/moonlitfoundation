import WebsiteImageField from "./WebsiteImageField";

const asNumber = (value, fallback = 1) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const byPosition = (left, right) => asNumber(left.row) - asNumber(right.row) || asNumber(left.order) - asNumber(right.order) || String(left.name).localeCompare(String(right.name));
const newId = () => globalThis.crypto?.randomUUID?.() || `team-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function TeamMembersField({field,value,onChange,disabled,onBusy}) {
  const members=Array.isArray(value)?value:[];
  const ordered=[...members].sort(byPosition);
  const update=(id,changes)=>onChange(members.map(member=>member.id===id?{...member,...changes}:member));
  function addPerson() {
    let row=Math.max(1,...members.map(member=>asNumber(member.row)));
    let order=Math.max(0,...members.filter(member=>asNumber(member.row)===row).map(member=>asNumber(member.order,0)))+1;
    if(order>50&&row<50){row+=1;order=1;}
    onChange([...members,{id:newId(),name:"",role:"",image:"",row,order}]);
  }
  function removePerson(member) {
    if(window.confirm(`Remove ${member.name||"this person"} from the team?`))onChange(members.filter(item=>item.id!==member.id));
  }
  return <div className="cms-team-editor">
    <div className="cms-team-toolbar"><div><p>Add as many people as needed.</p><small>Row number controls the group. Position controls the left-to-right order within that row.</small></div><button type="button" className="mf-btn mf-btn-primary" onClick={addPerson} disabled={disabled||members.length>=(field.maxItems||100)}><i className="fa-solid fa-plus" aria-hidden="true"/> Add person</button></div>
    {!ordered.length&&<p className="ws-empty">No team members yet. Select Add person to create the first card.</p>}
    <div className="cms-team-grid">{ordered.map((member,index)=><section className="cms-team-card" key={member.id}>
      <header><div><span>Person {index+1}</span><h4>{member.name||"New team member"}</h4></div><button type="button" className="mf-admin-btn mf-admin-btn-neutral" onClick={()=>removePerson(member)} disabled={disabled} aria-label={`Remove ${member.name||"team member"}`}><i className="fa-solid fa-trash" aria-hidden="true"/> Remove</button></header>
      <div className="cms-team-card-fields">
        <label className="cms-field"><span className="mf-label">Name</span><input className="mf-input" required maxLength={150} value={member.name??""} onChange={event=>update(member.id,{name:event.target.value})}/></label>
        <label className="cms-field"><span className="mf-label">Role</span><input className="mf-input" required maxLength={150} value={member.role??""} onChange={event=>update(member.id,{role:event.target.value})}/></label>
        <label className="cms-field"><span className="mf-label">Row number</span><input className="mf-input" required type="number" min={1} max={50} step={1} value={member.row??""} onChange={event=>update(member.id,{row:event.target.value===""?"":Number(event.target.value)})}/></label>
        <label className="cms-field"><span className="mf-label">Position in row</span><input className="mf-input" required type="number" min={1} max={50} step={1} value={member.order??""} onChange={event=>update(member.id,{order:event.target.value===""?"":Number(event.target.value)})}/></label>
      </div>
      <div className="cms-team-photo"><span className="mf-label">Photo</span><WebsiteImageField field={{...field,key:`${field.key}-${member.id}`,label:`photo for ${member.name||"team member"}`}} value={member.image} onChange={image=>update(member.id,{image})} disabled={disabled} onBusy={onBusy}/></div>
    </section>)}</div>
  </div>;
}
