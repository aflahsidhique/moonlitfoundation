import Button from "./Button";
import Img from "./Img";

const ACCENT_VAR = { red: "var(--mf-red)", green: "var(--mf-green)", blue: "var(--mf-sky)", yellow: "var(--mf-yellow)", purple: "var(--mf-purple)" };

// One alternating image/copy block on the Programs page — image left or
// right (`reverse`), colored eyebrow/checklist/CTA matching the program's
// accent, a couple of headline stats, and a "Join this Program" CTA.
export default function ProgramDetail({ id, reverse, accent, eyebrow, titleLead, titleHighlight, image, fallback, alt, description, checklist, stats, ctaDark }) {
  return (
    <section id={id} className="max-w-7xl mx-auto px-5 py-14 grid lg:grid-cols-2 gap-14 items-center scroll-mt-24">
      <div className={"relative mf-fade" + (reverse ? " lg:order-2" : "")}>
        <div className="mf-blob-frame">
          <div className="mf-blob h-[280px] md:h-[370px]">
            <Img src={image} fallback={fallback} alt={alt} />
          </div>
        </div>
        <div className={"mf-dots absolute -bottom-4 hidden md:block" + (reverse ? " -right-2" : " -left-2")} aria-hidden="true"></div>
      </div>
      <div className={"mf-fade" + (reverse ? " lg:order-1" : "")}>
        <p className="mf-eyebrow mb-3" style={{ color: ACCENT_VAR[accent] }}>{eyebrow}</p>
        <h2 className="text-3xl md:text-4xl">{titleLead} <span className="mf-hl mf-stroke">{titleHighlight}</span></h2>
        <div className="mf-divider my-6"></div>
        <p className="text-[15px] leading-relaxed mb-6">{description}</p>
        <ul className="space-y-3 mb-7">
          {checklist.map((c) => (
            <li key={c} className="mf-check"><i className={`fa-solid fa-check bg-acc-${accent}`}></i><span className="text-[14px]">{c}</span></li>
          ))}
        </ul>
        <div className="flex gap-8 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <i className={`fa-solid fa-${s.icon} text-2xl tx-acc-${accent}`}></i>
              <div><p className="font-bold text-xl text-[#111827]">{s.value}</p><p className="text-xs">{s.label}</p></div>
            </div>
          ))}
        </div>
        <Button to="/get-involved#volunteer" variant={null} icon="arrow-right" className={`bg-acc-${accent} ${ctaDark ? "!text-[#0A1F44]" : "text-white"}`}>Join this Program</Button>
      </div>
    </section>
  );
}
