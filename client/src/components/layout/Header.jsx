import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Brand from "../ui/Brand";
import Icon from "../ui/Icon";
import { useMotion } from "../../hooks/useMotion";

const NAV_LINKS = [
  { to: "/about", label: "Our story" },
  { to: "/programs", label: "Our work" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const menuRef = useRef(null);
  const location = useLocation();
  const { lenisRef } = useMotion();

  useEffect(() => {
    const scroll = () => setStuck(window.scrollY > 20);
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    const dialog = dialogRef.current;
    const menuButton = menuRef.current;
    if (!open) { if (dialog.open) dialog.close(); return; }
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const lenis = lenisRef.current;
    lenis?.stop();
    const desktop = window.matchMedia("(min-width: 1100px)");
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = overflow;
      lenis?.start();
      desktop.removeEventListener("change", resize);
      if (dialog.open) dialog.close();
      menuButton?.focus();
    };
  }, [open, lenisRef]);

  return <>
    <header className={`site-header${stuck ? " is-stuck" : ""}`}>
      <div className="site-header-inner site-container">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => `site-nav-link${isActive ? " is-active" : ""}`}>{link.label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <NavLink className="header-volunteer" to="/get-involved#volunteer">Get involved <Icon size={16} /></NavLink>
          <NavLink to="/contact" className="action-button action-button--yellow header-donate"><Icon name="heart" size={16} /><span>Support us</span></NavLink>
          <button ref={menuRef} className="menu-toggle" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}><Icon name="menu" size={24} /></button>
        </div>
      </div>
    </header>
    <dialog ref={dialogRef} id="mobile-menu" className="mobile-menu" aria-label="Navigation menu" onCancel={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="mobile-menu-top"><Brand /><button className="menu-toggle" aria-label="Close menu" onClick={() => setOpen(false)}><Icon name="close" /></button></div>
      <p className="section-label">A little time. A lasting difference.</p>
      <nav aria-label="Mobile navigation">
        {[{ to: "/", label: "Home" }, ...NAV_LINKS, { to: "/get-involved", label: "Get involved" }].map((link, index) => <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}><span><small>0{index + 1}</small>{link.label}</span><Icon /></NavLink>)}
      </nav>
      <NavLink to="/get-involved#volunteer" className="action-button action-button--yellow" onClick={() => setOpen(false)}>Become a volunteer <Icon /></NavLink>
      <a className="mobile-email" href="mailto:moonlitfoundation@gmail.com">moonlitfoundation@gmail.com</a>
    </dialog>
  </>;
}
