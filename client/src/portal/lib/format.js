export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function qrUrl(volunteerId) {
  const verifyUrl = window.location.origin + "/portal/verify?id=" + encodeURIComponent(volunteerId);
  return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=" + encodeURIComponent(verifyUrl);
}

export function certVerifyUrl(attendanceId) {
  return window.location.origin + "/portal/certificate-verify?id=" + encodeURIComponent(attendanceId);
}

export function certQrUrl(attendanceId) {
  return "https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=" + encodeURIComponent(certVerifyUrl(attendanceId));
}
