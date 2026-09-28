import { useEffect, useRef, useState } from "react";
import { useMotion } from "../../hooks/useMotion";

// Loaded separately so the WebGL renderer never blocks the page or its photos.
export default function HopeSculpture() {
  const mountRef = useRef(null);
  const { enabled } = useMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose = () => {};
    const host = mountRef.current;
    setReady(false);

    async function setup() {
      try {
        const THREE = await import("three");
        if (cancelled) return;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
        camera.position.z = 6.4;
        const geometry = new THREE.TorusKnotGeometry(1, 0.32, 144, 24, 2, 3);
        const material = new THREE.MeshPhysicalMaterial({ color: 0xf5b921, metalness: 0.3, roughness: 0.23, clearcoat: 1, clearcoatRoughness: 0.18 });
        const knot = new THREE.Mesh(geometry, material);
        knot.rotation.set(0.3, -0.5, -0.45);
        scene.add(knot);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x785611, 3));
        const key = new THREE.DirectionalLight(0xfff5d7, 5);
        key.position.set(-3, 5, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0xffffff, 3);
        rim.position.set(4, -1, 2);
        scene.add(rim);
        host.appendChild(renderer.domElement);
        let inView = true;
        let frame = 0;
        let last = 0;
        let phase = 0;
        const pointer = { x: 0, y: 0 };
        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        const render = (time) => {
          frame = 0;
          if (!enabled || !inView || document.hidden) return;
          phase += Math.min((time - last) / 1000 || 0, 0.05);
          last = time;
          knot.rotation.y = -0.5 + phase * 0.2 + pointer.x * 0.3;
          knot.rotation.x += (0.3 + pointer.y * 0.25 - knot.rotation.x) * 0.04;
          knot.position.y = Math.sin(phase * 0.8) * 0.07;
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };
        const start = () => { if (enabled && inView && !document.hidden && !frame) frame = requestAnimationFrame(render); };
        const visibility = () => {
          if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else start();
        };
        const move = (event) => {
          const rect = host.getBoundingClientRect();
          pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
          pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
        };
        const reset = () => { pointer.x = 0; pointer.y = 0; };
        const lost = (event) => { event.preventDefault(); cancelAnimationFrame(frame); setReady(false); };
        const observer = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          if (inView) start(); else { cancelAnimationFrame(frame); frame = 0; }
        });
        observer.observe(host);
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        host.addEventListener("pointermove", move);
        host.addEventListener("pointerleave", reset);
        renderer.domElement.addEventListener("webglcontextlost", lost);
        document.addEventListener("visibilitychange", visibility);
        resize();
        setReady(true);
        start();
        dispose = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          resizeObserver.disconnect();
          host.removeEventListener("pointermove", move);
          host.removeEventListener("pointerleave", reset);
          document.removeEventListener("visibilitychange", visibility);
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch { /* Keep the sculptural CSS fallback visible without WebGL. */ }
    }
    setup();
    return () => { cancelled = true; dispose(); };
  }, [enabled]);

  return <div className={`hope-sculpture${ready ? " is-ready" : ""}`} aria-hidden="true"><div className="sculpture-fallback"><i /><i /><i /></div><div className="sculpture-canvas" ref={mountRef} /></div>;
}
