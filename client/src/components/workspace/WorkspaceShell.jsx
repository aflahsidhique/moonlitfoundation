import { Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "../../styles/workspace.css";

export default function WorkspaceShell({ area, items, name, counts = {}, onLogout, children }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  const menu = useRef(null);
  const toggle = useRef(null);
  const main = useRef(null);
  const label = area === "admin" ? "Admin workspace" : "Volunteer portal";
  const current = items.find((item) => item.path != null && (item.end ? pathname.replace(/\/$/, "") === `/${area}` : pathname.startsWith(`/${area}/${item.path}`))) || items[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    main.current?.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${current.title} · ${label} — Moonlit Foundation`;
  }, [pathname, current.title, label]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const update = () => { setMobile(query.matches); if (!query.matches) setOpen(false); };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open || !mobile) return;
    const previous = document.body.style.overflow;
    const toggleButton = toggle.current;
    document.body.style.overflow = "hidden";
    menu.current.querySelector("button, a")?.focus();
    const keydown = (event) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const elements = [...menu.current.querySelectorAll("a, button")].filter((el) => !el.disabled);
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", keydown); toggleButton?.focus(); };
  }, [open, mobile]);

  return (
    <div className={`workspace workspace-${area}`}>
      <a className="ws-skip" href="#workspace-main">Skip to content</a>
      <div className="ws-mobile-bar">
        <Link className="ws-wordmark" to="/">moonlit<span>FOUNDATION</span></Link>
        <button ref={toggle} className="ws-icon-button" aria-label="Open menu" aria-expanded={open} aria-controls="workspace-navigation" onClick={() => setOpen(true)}><i className="fa-solid fa-bars" aria-hidden="true" /></button>
      </div>
      {open && mobile && <div className="ws-backdrop" onClick={() => setOpen(false)} />}
      <aside id="workspace-navigation" ref={menu} className={`ws-sidebar${open ? " is-open" : ""}`} inert={mobile && !open} role={mobile && open ? "dialog" : undefined} aria-modal={mobile && open ? true : undefined} aria-label={label}>
        <div className="ws-brand-row">
          <Link className="ws-brand" to="/"><img src="/logo.png" alt="" /><span className="ws-wordmark">moonlit<span>FOUNDATION</span></span></Link>
          {mobile && <button className="ws-icon-button" aria-label="Close menu" onClick={() => setOpen(false)}><i className="fa-solid fa-xmark" aria-hidden="true" /></button>}
        </div>
        <p className="ws-nav-label">{label}</p>
        <nav aria-label={label}>
          {items.filter((item) => item.path != null).map((item) => <NavLink key={item.path} to={`/${area}${item.path ? `/${item.path}` : ""}`} end={item.end} className={({ isActive }) => `ws-nav-link${isActive ? " is-active" : ""}`} onClick={() => setOpen(false)}>
            <i className={`fa-solid fa-${item.icon}`} aria-hidden="true" /><span>{item.label}</span>
            {counts[item.countKey] > 0 && <span className="ws-count">{counts[item.countKey]}</span>}
          </NavLink>)}
        </nav>
        <div className="ws-sidebar-bottom">
          <Link to="/" className="ws-site-link">Visit the website <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></Link>
          <div className="ws-account"><span className="ws-avatar">{(name || "M").slice(0, 1).toUpperCase()}</span><div><strong>{name || "Moonlit member"}</strong><small>{area === "admin" ? "Administrator" : "Making a difference"}</small></div><button className="ws-icon-button" aria-label="Log out" onClick={onLogout}><i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" /></button></div>
        </div>
      </aside>
      <div className="ws-main-column" inert={open && mobile}>
        <header className="ws-topbar"><p>Moonlit Foundation <span>/</span> {current.title}</p><span className="ws-workspace-tag"><span /> {area === "admin" ? "Community workspace" : "Together, we do more"}</span></header>
        <main ref={main} id="workspace-main" className="ws-main" tabIndex={-1}>
          <div className="ws-page-heading"><div><p className="ws-eyebrow">{label}</p><h1>{current.title}</h1>{current.subtitle && <p className="ws-description">{current.subtitle}</p>}</div><time>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date())}</time></div>
          <div key={pathname} className="ws-page-content"><Suspense fallback={<p className="ws-empty" role="status">Loading your workspace…</p>}>{children}</Suspense></div>
        </main>
        <footer className="ws-footer"><span>A little time. A lasting difference.</span><span>Moonlit Foundation</span></footer>
      </div>
    </div>
  );
}
