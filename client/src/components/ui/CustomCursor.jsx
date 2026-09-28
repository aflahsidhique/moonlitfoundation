import { useEffect, useRef } from "react";
import gsap from "gsap";

// Site-wide custom cursor: a small dot that tracks the pointer exactly and a
// ring that trails behind it. The ring swells over anything clickable, shrinks
// on press, and both step aside (native cursor returns) over text fields and
// embedded iframes, where a fake cursor would get in the way or stop tracking.
// Mouse / trackpad only; skipped entirely under prefers-reduced-motion.
const INTERACTIVE = "a, button, [role='button'], label, select, summary, input[type='checkbox'], input[type='radio'], input[type='file'], .mf-card, .mf-gal-item";
const NATIVE = "input:not([type='checkbox']):not([type='radio']):not([type='file']), textarea, [contenteditable], iframe";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const root = document.documentElement;
    const dot = dotRef.current;
    const ring = ringRef.current;
    root.classList.add("mf-has-cursor");

    const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

    const setState = (name, on) => root.classList.toggle(name, on);

    const onMove = (e) => {
      dx(e.clientX); dy(e.clientY);
      rx(e.clientX); ry(e.clientY);
      setState("mf-cursor-visible", true);
    };
    const onOver = (e) => {
      const t = e.target instanceof Element ? e.target : null;
      setState("mf-cursor-native", !!t?.closest(NATIVE));
      setState("mf-cursor-hover", !!t?.closest(INTERACTIVE));
    };
    const onDown = () => setState("mf-cursor-down", true);
    const onUp = () => setState("mf-cursor-down", false);
    const onLeave = () => setState("mf-cursor-visible", false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    root.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      root.removeEventListener("mouseleave", onLeave);
      root.classList.remove("mf-has-cursor", "mf-cursor-visible", "mf-cursor-native", "mf-cursor-hover", "mf-cursor-down");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="mf-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="mf-cursor-dot" aria-hidden="true" />
    </>
  );
}
