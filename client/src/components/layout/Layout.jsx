import { Outlet, useLocation } from "react-router-dom";
import { Suspense, useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Header from "./Header";
import Footer from "./Footer";
import MotionProvider from "../motion/MotionProvider";
import { useMotion } from "../../hooks/useMotion";
import "../../styles/site.css";
import { WebsiteProvider } from "../content/WebsiteProvider";

function PublicLayout() {
  const location = useLocation();
  const { lenisRef } = useMotion();
  const mainRef = useRef(null);
  const initial = useRef(true);

  useEffect(() => {
    let frame;
    let observer;
    const navigate = () => {
      let target;
      try { target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { /* Ignore malformed anchors. */ }
      if (location.hash && !target) return false;
      observer?.disconnect();
      const top = target ? target.getBoundingClientRect().top + window.scrollY - 110 : 0;
      if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo({ top, behavior: "instant" });
      ScrollTrigger.refresh();
      if (!initial.current) {
        if (target && !target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        (target || mainRef.current)?.focus({ preventScroll: true });
      }
      initial.current = false;
      return true;
    };
    frame = requestAnimationFrame(() => {
      if (!navigate() && mainRef.current) {
        // A lazy route can resolve after the URL changes. Wait for its anchor.
        observer = new MutationObserver(() => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(navigate);
        });
        observer.observe(mainRef.current, { childList: true, subtree: true });
      }
    });
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [location.pathname, location.hash, lenisRef]);

  useEffect(() => {
    const titles = { "/": "Small acts. Extraordinary change.", "/about": "Our story", "/programs": "Our work", "/events": "Events", "/gallery": "Gallery", "/get-involved": "Get involved", "/contact": "Get in touch" };
    document.title = `${titles[location.pathname] || "Welcome"} — Moonlit Foundation`;
  }, [location.pathname]);

  return <><a href="#main-content" className="skip-link">Skip to content</a><Header /><main ref={mainRef} id="main-content" tabIndex={-1}><Suspense fallback={<div className="route-loading" role="status">A little good is on its way…</div>}><Outlet /></Suspense></main><Footer /></>;
}

export default function Layout() {
  return <WebsiteProvider><MotionProvider><PublicLayout /></MotionProvider></WebsiteProvider>;
}
