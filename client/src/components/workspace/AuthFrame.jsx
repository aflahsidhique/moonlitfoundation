import { Link } from "react-router-dom";
import "../../styles/workspace.css";

export default function AuthFrame({ admin = false, children }) {
  return <div className="ws-auth">
    <section className="ws-auth-story">
      <Link className="ws-brand" to="/"><img src="/logo.png" alt="" /><span className="ws-wordmark">moonlit<span>FOUNDATION</span></span></Link>
      <div className="ws-auth-copy"><p className="ws-eyebrow">{admin ? "Behind every act of kindness" : "Your time. Your community."}</p><h2>{admin ? <>Great change.<br />Starts with <em>you.</em></> : <>Small acts.<br /><em>Extraordinary</em><br />people.</>}</h2><p>{admin ? "A thoughtful space to bring people together, create moments that matter, and keep our community moving." : "Show up for your community. Find your next event, celebrate your impact, and be part of something bigger."}</p></div>
      <div className="ws-auth-photo"><img src="/images/volunteers.webp" alt="Moonlit volunteers together at a community beach cleanup" /><span>Connected by kindness. United in action.</span></div>
    </section>
    <main className="ws-auth-main"><Link className="ws-back-link" to="/"><i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to website</Link><div className="ws-auth-form"><span className="ws-auth-icon"><i className={`fa-solid fa-${admin ? "sun" : "heart"}`} aria-hidden="true" /></span><p className="ws-eyebrow">{admin ? "Admin workspace" : "Volunteer portal"}</p>{children}</div><p className="ws-auth-footer">A little time. A lasting difference.</p></main>
  </div>;
}
