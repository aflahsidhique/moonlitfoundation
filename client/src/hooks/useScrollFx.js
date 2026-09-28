import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotion } from "./useMotion";

gsap.registerPlugin(ScrollTrigger);

export function useScrollFx(containerRef) {
  const { enabled } = useMotion();
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const counters = [...container.querySelectorAll("[data-count]")];
    const finalCount = (element) => { element.textContent = Number(element.dataset.count).toLocaleString("en-IN") + (element.dataset.suffix ?? "+"); };
    counters.forEach(finalCount);
    if (!enabled) return;
    const cleanups = [];
    const counterTweens = new Map();
    let active = true;
    const context = gsap.context(() => {
      const lines = container.querySelectorAll(".hero-line > span");
      if (lines.length) gsap.from(lines, { yPercent: 115, rotation: 3, duration: 1.15, stagger: 0.1, ease: "power4.out", clearProps: "all" });
      const heroElements = container.querySelectorAll(".hero-reveal");
      if (heroElements.length) gsap.from(heroElements, { y: 24, autoAlpha: 0, duration: 0.85, stagger: 0.065, delay: 0.15, ease: "power3.out", clearProps: "all" });

      const faders = [...container.querySelectorAll(".mf-fade")].filter((element) => !element.parentElement.closest(".mf-fade"));
      faders.forEach((element) => {
        gsap.fromTo(element, { y: 34, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", clearProps: "all",
          scrollTrigger: { trigger: element, start: "top 94%", once: true },
        });
      });
      counters.forEach((element) => {
        const value = { count: 0 };
        const tween = gsap.to(value, {
          count: Number(element.dataset.count), duration: 1.8, ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 96%", once: true },
          onUpdate: () => { element.textContent = Math.round(value.count).toLocaleString("en-IN") + (element.dataset.suffix ?? "+"); },
        });
        counterTweens.set(element, tween);
      });
      container.querySelectorAll("[data-spin]").forEach((element) => {
        gsap.to(element, { rotation: 100, ease: "none", scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 1.2 } });
      });
      if (window.matchMedia("(min-width: 768px)").matches) {
        container.querySelectorAll("[data-parallax]").forEach((element) => {
          gsap.fromTo(element, { y: -Number(element.dataset.parallax) / 2 }, { y: Number(element.dataset.parallax), ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: 1 } });
        });
      }
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        container.querySelectorAll("[data-tilt], [data-magnetic]").forEach((element) => {
          const tilt = element.hasAttribute("data-tilt");
          const x = gsap.quickTo(element, tilt ? "rotationY" : "x", { duration: 0.55, ease: "power3.out" });
          const y = gsap.quickTo(element, tilt ? "rotationX" : "y", { duration: 0.55, ease: "power3.out" });
          if (tilt) gsap.set(element, { transformPerspective: 900 });
          const move = (event) => {
            const rect = element.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;
            x(px * (tilt ? 6 : 12));
            y(py * (tilt ? -6 : 10));
          };
          const reset = () => { x(0); y(0); };
          element.addEventListener("pointermove", move);
          element.addEventListener("pointerleave", reset);
          cleanups.push(() => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", reset); x.tween.kill(); y.tween.kill(); });
        });
      }
    }, container);

    const refresh = () => { if (active) ScrollTrigger.refresh(); };
    const frame = requestAnimationFrame(refresh);
    document.fonts?.ready.then(refresh);
    // Published figures can arrive after the animation was created. Stop the
    // old tween so it cannot write its previous value over the new CMS number.
    const counterChanges = new MutationObserver((records) => {
      records.forEach(({ target }) => { counterTweens.get(target)?.kill(); finalCount(target); });
    });
    counterChanges.observe(container, { subtree: true, attributes: true, attributeFilter: ["data-count", "data-suffix"] });
    // Includes replacement photos and newly loaded gallery cards.
    container.addEventListener("load", refresh, true);
    let resizeFrame;
    const resize = new ResizeObserver(() => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(refresh); });
    resize.observe(container);
    return () => { active = false; cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame); resize.disconnect(); counterChanges.disconnect(); container.removeEventListener("load", refresh, true); cleanups.forEach((cleanup) => cleanup()); context.revert(); counters.forEach(finalCount); };
  }, [containerRef, enabled]);
}
