import { useEffect } from "react";

// Matches the legacy .mf-lightbox modal shell — centered card, click-outside
// and Escape to close.
export default function Modal({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return;
    function onKeydown(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="mf-lightbox open" aria-modal="true" role="dialog" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mf-form-card max-w-md w-full mx-4 relative">
        <button className="mf-car-arrow absolute top-4 right-4" aria-label="Close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        <h3 className="text-xl mb-1">{title}</h3>
        {subtitle && <p className="text-[13px] mb-5">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
