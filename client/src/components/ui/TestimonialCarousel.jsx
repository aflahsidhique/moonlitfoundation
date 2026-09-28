import { useRef } from "react";
import Img from "./Img";

// items: [{ img, fallback, alt, quote, name }]
export default function TestimonialCarousel({ items }) {
  const trackRef = useRef(null);

  function scrollAmt() {
    const card = trackRef.current?.querySelector(".mf-card");
    return card ? card.offsetWidth + 24 : 320;
  }

  return (
    <div className="mf-fade">
      <div className="flex justify-end gap-3 mb-5">
        <button className="mf-car-arrow" aria-label="Previous story" onClick={() => trackRef.current?.scrollBy({ left: -scrollAmt(), behavior: "smooth" })}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button className="mf-car-arrow" aria-label="Next story" onClick={() => trackRef.current?.scrollBy({ left: scrollAmt(), behavior: "smooth" })}>
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div ref={trackRef} className="mf-h-scroll flex gap-6 overflow-x-auto snap-x pb-2" style={{ scrollbarWidth: "none" }}>
        {items.map((t, i) => (
          <article key={i} className="mf-card min-w-[260px] md:min-w-[280px] snap-start">
            <Img className="w-full h-44 object-cover" src={t.img} fallback={t.fallback} alt={t.alt} />
            <div className="p-5">
              <i className="fa-solid fa-quote-left mf-quote-icon"></i>
              <p className="text-[13.5px] mt-2 mb-3 leading-relaxed text-[#111827]">"{t.quote}"</p>
              <p className="text-xs font-semibold text-[#4B5563]">— {t.name}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
