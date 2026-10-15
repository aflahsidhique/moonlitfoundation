export default function StatCounter({ icon, count, suffix = "+", label }) {
  return <div className="text-center px-3 xl:border-l border-white/15">
      <i className={`fa-solid fa-${icon} mf-gold-icon`} />
      <p className="mf-stat-num mt-2" data-count={count} data-suffix={suffix}>{count.toLocaleString("en-IN")}{suffix}</p>
      <p className="mf-stat-label">{label}</p>
    </div>;
}
