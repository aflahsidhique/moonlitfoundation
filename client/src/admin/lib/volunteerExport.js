const yesNo = (value) => value ? "Yes" : "No";
const valueOrBlank = (value) => value === null || value === undefined ? "" : String(value);

function dateValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? valueOrBlank(value) : date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function dateTimeValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? valueOrBlank(value) : date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function donationHistory(value) {
  if (!Array.isArray(value)) return "";
  return value.map((record) => [dateValue(record.donationDate), record.location, record.notes].filter(Boolean).join(" - ")).join("; ");
}

const BASIC_FIELDS = [
  { label: "Volunteer ID", value: (v) => v.volunteerId },
  { label: "Full Name", value: (v) => v.fullName },
  { label: "Date of Birth", value: (v) => dateValue(v.dob) },
  { label: "Gender", value: (v) => v.gender },
  { label: "Mobile", value: (v) => v.mobile },
  { label: "WhatsApp", value: (v) => v.whatsapp },
  { label: "Email", value: (v) => v.email },
  { label: "District", value: (v) => v.district },
  { label: "Taluk", value: (v) => v.taluk },
  { label: "Panchayat / Municipality", value: (v) => v.panchayat },
  { label: "Status", value: (v) => v.status },
  { label: "Submitted", value: (v) => dateTimeValue(v.createdAt) }
];

const BLOOD_FIELDS = [
  { label: "Blood Group", value: (v) => v.bloodGroup },
  { label: "Blood Donor", value: (v) => yesNo(v.isBloodDonor) },
  { label: "Donation Available", value: (v) => yesNo(v.bloodDonationAvailable) },
  { label: "Eligible Now", value: (v) => yesNo(v.eligible) },
  { label: "Donations Logged", value: (v) => v.donationCount || 0 },
  { label: "Self-reported Last Donation", value: (v) => dateValue(v.lastBloodDonationDate) },
  { label: "Last Logged Donation", value: (v) => dateValue(v.lastDonationDate) },
  { label: "Next Eligible Date", value: (v) => dateValue(v.nextEligibleDate) },
  { label: "Weight (kg)", value: (v) => v.weight },
  { label: "Medical Conditions", value: (v) => v.medicalConditions }
];

const ALL_FIELDS = [
  { label: "Database ID", value: (v) => v.id },
  ...BASIC_FIELDS.slice(0, 7),
  { label: "Aadhaar", value: (v) => v.aadhaar },
  { label: "Photo URL", value: (v) => v.photoUrl },
  { label: "House / Street", value: (v) => v.address },
  { label: "State", value: (v) => v.state },
  ...BASIC_FIELDS.slice(7, 10),
  { label: "Ward", value: (v) => v.ward },
  { label: "PIN", value: (v) => v.pin },
  { label: "Emergency Contact", value: (v) => v.emergencyName },
  { label: "Emergency Relationship", value: (v) => v.emergencyRelationship },
  { label: "Emergency Phone", value: (v) => v.emergencyPhone },
  { label: "Skills", value: (v) => v.skills },
  { label: "Available Time", value: (v) => v.availableTime },
  ...BLOOD_FIELDS,
  { label: "Donation History", value: (v) => donationHistory(v.bloodDonations) },
  { label: "Instagram", value: (v) => v.instagram },
  { label: "Facebook", value: (v) => v.facebook },
  { label: "LinkedIn", value: (v) => v.linkedin },
  { label: "ID Type", value: (v) => v.idType },
  { label: "ID Document URL", value: (v) => v.idUploadUrl },
  { label: "Message", value: (v) => v.message },
  { label: "Latitude", value: (v) => v.lat },
  { label: "Longitude", value: (v) => v.lng },
  ...BASIC_FIELDS.slice(10),
  { label: "Updated", value: (v) => dateTimeValue(v.updatedAt) }
];

export const VOLUNTEER_EXPORT_PRESETS = {
  all: { label: "All fields", description: "Every registration, address, emergency, blood, social and verification field.", fields: ALL_FIELDS },
  contact: { label: "Basic contact fields", description: "Identity, phone, email, location, status and submission date.", fields: BASIC_FIELDS },
  blood: { label: "Basic fields + blood data", description: "Contact fields plus donor status, eligibility and donation details.", fields: [...BASIC_FIELDS, ...BLOOD_FIELDS] }
};

export function volunteerExportTable(volunteers, preset) {
  const fields = VOLUNTEER_EXPORT_PRESETS[preset]?.fields || BASIC_FIELDS;
  return {
    headers: fields.map((field) => field.label),
    rows: volunteers.map((volunteer) => fields.map((field) => valueOrBlank(field.value(volunteer))))
  };
}

function localDateStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export async function exportVolunteers(volunteers, preset, format) {
  const definition = VOLUNTEER_EXPORT_PRESETS[preset] || VOLUNTEER_EXPORT_PRESETS.contact;
  const { headers, rows } = volunteerExportTable(volunteers, preset);
  const baseName = `moonlit-volunteers-${preset}-${localDateStamp()}`;

  if (format === "xlsx") {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet["!cols"] = headers.map((header, index) => ({
      wch: Math.min(42, Math.max(12, header.length + 2, ...rows.slice(0, 100).map((row) => row[index].length + 2)))
    }));
    worksheet["!autofilter"] = { ref: worksheet["!ref"] };
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Volunteers");
    XLSX.writeFile(workbook, `${baseName}.xlsx`, { compression: true });
    return `${definition.label} exported as Excel.`;
  }

  const [{ jsPDF }, tableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const autoTable = tableModule.default || tableModule.autoTable;
  const isWide = headers.length > 12;
  const document = new jsPDF({ orientation: "landscape", unit: "mm", format: isWide ? "a3" : "a4" });
  document.setProperties({ title: `Moonlit Foundation Volunteers - ${definition.label}` });
  autoTable(document, {
    head: [headers],
    body: rows,
    startY: 20,
    margin: { top: 20, right: 10, bottom: 12, left: 10 },
    theme: "grid",
    styles: { font: "helvetica", fontSize: isWide ? 6 : 7.5, cellPadding: 1.6, overflow: "linebreak", valign: "top" },
    headStyles: { fillColor: [10, 31, 68], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 249, 252] },
    horizontalPageBreak: isWide,
    horizontalPageBreakRepeat: [0, 1],
    didDrawPage: () => {
      const pageWidth = document.internal.pageSize.getWidth();
      document.setFont("helvetica", "bold");
      document.setFontSize(10);
      document.setTextColor(10, 31, 68);
      document.text(`Moonlit Foundation - Volunteers - ${definition.label}`, 10, 11);
      document.setFont("helvetica", "normal");
      document.setFontSize(8);
      document.setTextColor(100);
      document.text(`${volunteers.length} record${volunteers.length === 1 ? "" : "s"}`, 10, 16);
      document.text(`Page ${document.getNumberOfPages()}`, pageWidth - 10, 11, { align: "right" });
    }
  });
  document.save(`${baseName}.pdf`);
  return `${definition.label} exported as PDF.`;
}
