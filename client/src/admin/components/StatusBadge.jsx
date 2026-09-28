export default function StatusBadge({ status }) {
  return <span className={`mf-status-badge mf-status-${status}`}>{status.replace(/_/g, " ")}</span>;
}
