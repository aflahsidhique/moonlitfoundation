import { useWebsite } from "../../hooks/useWebsite";
import StatCounter from "./StatCounter";

// The "Our Impact" counter band reused on Home, Programs and Get Involved —
// same six live-counted stats, wrapped by the caller's own <section> for
// padding. `compact` drops the "Our Impact" heading column (Get Involved's
// version is just the bare stat grid).
export default function ImpactBand({ spark = true, compact = false }) {
  const { field: cms } = useWebsite();
  const STATS = [
    { icon: "users", count: cms("impact.stats.count-2000"), label: <>{cms("impact.stats.volunteers")}<br />{cms("impact.stats.engaged")}</> },
    { icon: "droplet", count: cms("impact.stats.count-800"), label: <>{cms("impact.stats.blood-donors")}<br />{cms("impact.stats.registered")}</> },
    { icon: "hand-holding-heart", count: cms("impact.stats.count-1000"), label: <>{cms("impact.stats.families")}<br />{cms("impact.stats.supported")}</> },
    { icon: "box-open", count: cms("impact.stats.count-120"), label: <>{cms("impact.stats.relief")}<br />{cms("impact.stats.campaigns")}</> },
    { icon: "leaf", count: cms("impact.stats.count-1000-2"), label: <>{cms("impact.stats.trees")}<br />{cms("impact.stats.planted")}</> },
    { icon: "location-dot", count: cms("impact.stats.count-30"), label: <>{cms("impact.stats.communities")}<br />{cms("impact.stats.reached")}</> },
  ];

  const grid = (
    <div className={"grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-y-8" + (compact ? " xl:[&>*:first-child]:border-0" : " flex-1 w-full")}>
      {STATS.map((s) => <StatCounter key={s.icon} {...s} />)}
    </div>
  );

  if (compact) return <div className="mf-band px-8 py-10">{grid}</div>;

  return (
    <div className="mf-band px-8 py-10 flex flex-col xl:flex-row gap-10 items-center">
      <div className="min-w-[220px]">
        <p className="text-xs tracking-widest uppercase text-[#c9d4ee] mb-2">{cms("impact.page-content.our-impact")}</p>
        <h2 className="text-2xl leading-snug">{cms("impact.page-content.creating-change")}<br />{cms("impact.page-content.that")}{" "}<span className="mf-hl mf-stroke">{cms("impact.page-content.matters")}</span></h2>
        <p className="text-xs text-[#c9d4ee] mt-3">{cms("impact.page-content.real-people-real-impact")}{" "}{spark && <i className="fa-solid fa-arrow-turn-up mf-spark ml-1"></i>}</p>
      </div>
      {grid}
    </div>
  );
}
