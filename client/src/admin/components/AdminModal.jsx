import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export default function AdminModal({ open, onClose, title, wide, children, busy = false }) {
  const titleId = useId();
  const dialog = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    const main = document.querySelector(".ws-main");
    const mainOverflow = main?.style.overflowY;
    document.body.style.overflow = "hidden";
    if (main) main.style.overflowY = "hidden";
    dialog.current?.focus();
    function onKeydown(e) {
      if (e.key === "Escape" && !busy) close.current();
      if (e.key !== "Tab") return;
      const items = [...dialog.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary')].filter((el) => el.getClientRects().length);
      if (!items.length) { e.preventDefault(); return; }
      if (e.shiftKey && (document.activeElement === items[0] || document.activeElement === dialog.current)) { e.preventDefault(); items.at(-1).focus(); }
      else if (!e.shiftKey && (document.activeElement === items.at(-1) || document.activeElement === dialog.current)) { e.preventDefault(); items[0].focus(); }
    }
    document.addEventListener("keydown", onKeydown);
    return () => { document.removeEventListener("keydown", onKeydown); document.body.style.overflow = overflow; if (main) main.style.overflowY = mainOverflow; previous?.focus({ preventScroll: true }); };
  }, [open, busy]);

  if (!open) return null;

  // Keep dialogs outside the scrolling/animated page content so they cover
  // the viewport even when the event list has already been scrolled.
  return createPortal(
    <div className="mf-admin-modal-backdrop" onClick={(e) => !busy && e.target === e.currentTarget && onClose()}>
      <div ref={dialog} className="mf-admin-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={busy} tabIndex={-1} style={wide ? { maxWidth: 740 } : undefined}>
        <div className="ws-modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="ws-icon-button" aria-label="Close" onClick={onClose} disabled={busy}><i className="fa-solid fa-xmark" aria-hidden="true" /></button>
        </div>
        {children}
      </div>
    </div>,
    document.querySelector(".workspace") || document.body
  );
}
