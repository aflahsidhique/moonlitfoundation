export default function ChipList({ csv }) {
  const items = (csv || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!items.length) return <span className="text-[#9CA3AF]">None selected</span>;
  return items.map((item) => <span key={item} className="mf-pf-chip">{item}</span>);
}
