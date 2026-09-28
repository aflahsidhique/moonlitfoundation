import { useEffect, useState } from "react";
import Img from "./Img";

export default function HeroSlider({ slides, interval = 3000 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [paused, slides.length, interval]);

  return (
    <div
      className="absolute inset-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="Moonlit Foundation highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <div
          key={s.src}
          className={`mf-slide${i === index ? " is-active" : ""}`}
          aria-hidden={i !== index}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${slides.length}`}
        >
          <Img src={s.src} fallback={s.fallback} alt={s.alt} loading={i === 0 ? "eager" : "lazy"} />
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={`mf-slide-dot${i === index ? " is-active" : ""}`}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
