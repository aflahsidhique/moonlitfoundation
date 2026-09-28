import { resolveFileUrl } from "../lib/format";

export function VdSection({ children }) {
  return <p className="mf-vd-section">{children}</p>;
}

export function VdGrid({ children }) {
  return <dl className="mf-vd-grid">{children}</dl>;
}

export function VdField({ label, children }) {
  return <div><dt>{label}</dt><dd>{children ?? "—"}</dd></div>;
}

export function ChipList({ csv }) {
  const items = (csv || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!items.length) return <span className="text-[#9CA3AF]">None selected</span>;
  return items.map((i) => <span key={i} className="mf-vd-chip">{i}</span>);
}

export function FileLink({ url, label }) {
  if (!url) return <span className="text-[#9CA3AF]">Not provided</span>;
  return (
    <a className="mf-vd-file-link" href={resolveFileUrl(url)} target="_blank" rel="noopener noreferrer">
      {label} <i className="fa-solid fa-up-right-from-square text-[11px]"></i>
    </a>
  );
}
