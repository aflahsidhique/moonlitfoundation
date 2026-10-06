import { useState } from "react";
import AdminModal from "./AdminModal";
import { exportVolunteers, VOLUNTEER_EXPORT_PRESETS } from "../lib/volunteerExport";

const FORMATS = [
  { id: "xlsx", label: "Excel", note: ".xlsx spreadsheet", icon: "file-excel" },
  { id: "pdf", label: "PDF", note: "Print-ready document", icon: "file-pdf" }
];

export default function VolunteerExportModal({ open, count, loadVolunteers, onClose, onExported }) {
  const [format, setFormat] = useState("xlsx");
  const [preset, setPreset] = useState("contact");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setExporting(true);
    try {
      const volunteers = await loadVolunteers();
      const message = await exportVolunteers(volunteers, preset, format);
      onClose();
      onExported(message);
    } catch (err) {
      setError(err.message || "The export could not be created. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <AdminModal open={open} onClose={onClose} title="Export volunteer data" busy={exporting} wide>
      <form onSubmit={submit} className="ws-export-form">
        <fieldset disabled={exporting}>
          <p className="ws-export-summary">Exporting <strong>{count}</strong> volunteer record{count === 1 ? "" : "s"}. Full data loads only when you download.</p>

          <p className="ws-form-section">File format</p>
          <div className="ws-export-options ws-export-formats">
            {FORMATS.map((option) => (
              <label key={option.id} className={format === option.id ? "is-selected" : ""}>
                <input type="radio" name="exportFormat" value={option.id} checked={format === option.id} onChange={() => setFormat(option.id)} />
                <i className={`fa-solid fa-${option.icon}`} aria-hidden="true" />
                <span><strong>{option.label}</strong><small>{option.note}</small></span>
              </label>
            ))}
          </div>

          <p className="ws-form-section">Fields to include</p>
          <div className="ws-export-options">
            {Object.entries(VOLUNTEER_EXPORT_PRESETS).map(([id, option]) => (
              <label key={id} className={preset === id ? "is-selected" : ""}>
                <input type="radio" name="exportPreset" value={id} checked={preset === id} onChange={() => setPreset(id)} />
                <span><strong>{option.label}</strong><small>{option.description}</small></span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p className="ws-error" role="alert">{error}</p>}
        <div className="ws-form-actions">
          <button type="button" className="mf-btn mf-btn-outline" onClick={onClose} disabled={exporting}>Cancel</button>
          <button type="submit" className="mf-btn mf-btn-primary" disabled={exporting || !count}>
            {exporting ? <><i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> Creating file...</> : <><i className="fa-solid fa-download" aria-hidden="true" /> Download {format === "xlsx" ? "Excel" : "PDF"}</>}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
