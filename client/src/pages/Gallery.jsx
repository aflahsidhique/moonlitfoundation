import { useWebsite } from "../hooks/useWebsite";
import { useMemo, useState } from "react";
import PageFx from "../components/ui/PageFx";
import PageHero from "../components/ui/PageHero";
import Img from "../components/ui/Img";
import Lightbox from "../components/ui/Lightbox";

const CATEGORY_META = {
  blood: { label: "Blood Donation", chip: "bg-acc-red" },
  welfare: { label: "Community Welfare", chip: "bg-acc-green" },
  relief: { label: "Disaster Relief", chip: "bg-acc-blue" },
  environment: { label: "Environment", chip: "bg-acc-yellow !text-[#0A1F44]" },
  youth: { label: "Youth Development", chip: "bg-acc-purple" },
};

const FILTERS = [{ key: "all", label: "All" }, ...Object.entries(CATEGORY_META).map(([key, v]) => ({ key, label: v.label }))];

export default function Gallery() {
  const { field: cms, gallery, loading, error } = useWebsite();

  const [filter, setFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const visible = useMemo(() => gallery.filter(p => filter === "all" || p.category === filter).map(p => ({ ...p, cat: p.category, thumb: p.imageUrl, full: p.imageUrl, caption: p.caption || p.title })), [filter, gallery]);

  return (
    <PageFx>
      <PageHero
        crumb="Gallery"
        eyebrow={cms("gallery.page-introduction.eyebrow-gallery")}
        heading={<>{cms("gallery.page-introduction.captured-moments-of")}{" "}<span className="mf-hl mf-stroke">{cms("gallery.page-introduction.hope")}</span></>}
        description={cms("gallery.page-introduction.description-a-look-at-the-hands-faces-and-mom")}
      />

      <section className="max-w-7xl mx-auto px-5 pt-14">
        <div className="flex flex-wrap gap-3 mf-fade">
          {FILTERS.map((f) => (
            <button key={f.key} className={"mf-pill" + (filter === f.key ? " is-active" : "")} onClick={() => { setFilter(f.key); setLightboxIndex(null); }}>{f.label}</button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        <div aria-live="polite">{loading && <p className="py-8 text-center">Loading the gallery…</p>}{!loading && !visible.length && <p className="py-8 text-center">{error || "New moments are on their way. Check back soon."}</p>}</div><div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.map((p, i) => {
            const meta = CATEGORY_META[p.cat] || CATEGORY_META.welfare;
            return (
              <button key={p.id} type="button" className="mf-gal-item mf-fade text-left" onClick={() => setLightboxIndex(i)}>
                <Img src={p.thumb} fallback="/images/photo-placeholder.svg" alt={p.alt || p.caption} />
                <div className="mf-gal-overlay">
                  <span className={`mf-chip ${meta.chip} self-start mb-2`}>{meta.label}</span>
                  <p className="text-sm font-medium">{p.caption} <i className="fa-solid fa-magnifying-glass-plus ml-2 text-[#F5B921]"></i></p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Lightbox items={visible} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNav={(i) => setLightboxIndex((i + visible.length) % visible.length)} />
    </PageFx>
  );
}
