import { useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { MotionContext } from "../../hooks/useMotion";

gsap.registerPlugin(ScrollTrigger);

export default function MotionProvider({ children }) {
  const lenisRef = useRef(null);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem("moonlit-motion") === "paused"; } catch { return false; }
  });
  const enabled = !reduced && !paused;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      lerp: 0.085, smoothWheel: true, syncTouch: false,
      anchors: { offset: -110 },
      prevent: (node) => Boolean(node.closest?.('[data-lenis-prevent], [role="dialog"], dialog')),
    });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); lenisRef.current = null; };
  }, [enabled]);

  const value = useMemo(() => ({
    enabled, reduced, lenisRef,
    toggle: () => setPaused((previous) => {
      try { localStorage.setItem("moonlit-motion", previous ? "on" : "paused"); } catch { /* Storage is optional. */ }
      return !previous;
    }),
  }), [enabled, reduced]);

  return <MotionContext.Provider value={value}><div className={`site-shell${enabled ? "" : " motion-paused"}`}>{children}</div></MotionContext.Provider>;
}
