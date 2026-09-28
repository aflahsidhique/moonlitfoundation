import { useEffect } from "react";

// Full-screen image lightbox with prev/next/close (click, buttons, and
// arrow/Escape keys). `items` is the currently-visible (filtered) list;
// `index` is which one is open, or null when closed.
export default function Lightbox({ items, index, onClose, onNav }) {
  const open = items.length > 0 && index !== null && index !== undefined;

  useEffect(() => {
    if (!open) return;
    function onKeydown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNav(index - 1);
      if (e.key === "ArrowRight") onNav(index + 1);
    }
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [open, index, onClose, onNav]);

  if (!open) return null;
  const item = items[(index + items.length) % items.length];

  return (
    <div className="mf-lightbox open" aria-modal="true" role="dialog" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button className="mf-lb-close mf-car-arrow absolute top-6 right-6" aria-label="Close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
      <button className="mf-lb-prev mf-car-arrow absolute left-5 top-1/2 -translate-y-1/2" aria-label="Previous" onClick={() => onNav(index - 1)}><i className="fa-solid fa-chevron-left"></i></button>
      <div className="text-center">
        <img src={item.full} alt={item.alt || item.caption} />
        <p className="mf-lb-cap text-white mt-4 text-sm">{item.caption}</p>
      </div>
      <button className="mf-lb-next mf-car-arrow absolute right-5 top-1/2 -translate-y-1/2" aria-label="Next" onClick={() => onNav(index + 1)}><i className="fa-solid fa-chevron-right"></i></button>
    </div>
  );
}
