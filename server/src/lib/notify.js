const nodemailer = require("nodemailer");

function esc(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function portalUrl() {
  const base = process.env.PORTAL_URL || "http://localhost:5173/portal";
  return base.replace(/\/$/, "") + "/login";
}

// Indian mobile numbers are collected without a country code on the forms
// (e.g. "9445566778") — SMS Gate needs E.164. Leaves already-prefixed
// numbers (+91..., or another country code) untouched.
function toE164(phone) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return "+91" + digits;
  return "+" + digits;
}

function getMailTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
  });
}

async function sendEmailRaw(to, subject, text, html) {
  const transporter = getMailTransporter();
  if (!transporter) throw new Error("not configured (set GMAIL_USER / GMAIL_APP_PASSWORD)");
  await transporter.sendMail({
    from: '"Moonlit Foundation" <' + process.env.GMAIL_USER + ">",
    to: to,
    subject: subject,
    text: text,
    html: html
  });
}

async function sendSmsRaw(phone, text) {
  const base = process.env.SMSGATE_BASE_URL;
  const user = process.env.SMSGATE_USERNAME;
  const pass = process.env.SMSGATE_PASSWORD;
  if (!base || !user || !pass) {
    throw new Error("not configured (set SMSGATE_BASE_URL / SMSGATE_USERNAME / SMSGATE_PASSWORD)");
  }
  const res = await fetch(base.replace(/\/$/, "") + "/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(user + ":" + pass).toString("base64")
    },
    body: JSON.stringify({ phoneNumbers: [toE164(phone)], textMessage: { text: text } })
  });
  if (!res.ok) {
    const body = await res.text().catch(function () { return ""; });
    throw new Error("gateway returned " + res.status + (body ? ": " + body.slice(0, 200) : ""));
  }
}

async function sendApprovalEmail(volunteer, plainPassword) {
  const url = portalUrl();
  const text =
    "Hi " + volunteer.fullName + ",\n\n" +
    "Congratulations - your Moonlit Foundation volunteer application has been approved!\n\n" +
    "Volunteer ID: " + volunteer.volunteerId + "\n" +
    "Password: " + plainPassword + "\n" +
    "Portal: " + url + "\n\n" +
    "Log in to the volunteer portal to view your profile and status.\n\n" +
    "- Moonlit Foundation";
  const html =
    "<p>Hi " + esc(volunteer.fullName) + ",</p>" +
    "<p>Congratulations — your Moonlit Foundation volunteer application has been <strong>approved</strong>!</p>" +
    "<table cellpadding=\"6\" style=\"border-collapse:collapse\">" +
    "<tr><td><strong>Volunteer ID</strong></td><td>" + esc(volunteer.volunteerId) + "</td></tr>" +
    "<tr><td><strong>Password</strong></td><td>" + esc(plainPassword) + "</td></tr>" +
    "<tr><td><strong>Portal</strong></td><td><a href=\"" + esc(url) + "\">" + esc(url) + "</a></td></tr>" +
    "</table>" +
    "<p>Log in to the volunteer portal to view your profile and status.</p>" +
    "<p>— Moonlit Foundation</p>";
  await sendEmailRaw(volunteer.email, "You're approved! Your Moonlit Foundation Volunteer ID", text, html);
}

async function sendApprovalSms(volunteer, plainPassword) {
  const text =
    "Moonlit Foundation: You're approved! ID: " + volunteer.volunteerId +
    " Pass: " + plainPassword + " Portal: " + portalUrl();
  await sendSmsRaw(volunteer.mobile, text);
}

// Exact wording requested for urgent blood-request alerts:
//   URGENT BLOOD REQUEST
//   Patient: Rahul
//   Hospital: Medical College Kozhikode
//   Blood: O+
//   Please contact: 9876543210
//   Moonlit Foundation
function bloodAlertText(bloodRequest) {
  return (
    "URGENT BLOOD REQUEST\n" +
    "Patient: " + bloodRequest.patientName + "\n" +
    "Hospital: " + bloodRequest.hospital + "\n" +
    "Blood: " + bloodRequest.bloodGroup + "\n" +
    "Please contact: " + bloodRequest.phone + "\n" +
    "Moonlit Foundation"
  );
}

async function sendBloodAlertSms(volunteer, bloodRequest) {
  await sendSmsRaw(volunteer.mobile, bloodAlertText(bloodRequest));
}

async function sendBloodAlertEmail(volunteer, bloodRequest) {
  const text = bloodAlertText(bloodRequest) +
    "\n\nUnits needed: " + bloodRequest.units +
    "\nUrgency: " + bloodRequest.urgency +
    "\n\nRespond in the volunteer portal: " + portalUrl();
  const html =
    "<p style=\"font-weight:700;color:#DC2626\">URGENT BLOOD REQUEST</p>" +
    "<table cellpadding=\"6\" style=\"border-collapse:collapse\">" +
    "<tr><td><strong>Patient</strong></td><td>" + esc(bloodRequest.patientName) + "</td></tr>" +
    "<tr><td><strong>Hospital</strong></td><td>" + esc(bloodRequest.hospital) + "</td></tr>" +
    "<tr><td><strong>Blood Group</strong></td><td>" + esc(bloodRequest.bloodGroup) + "</td></tr>" +
    "<tr><td><strong>Units Needed</strong></td><td>" + esc(bloodRequest.units) + "</td></tr>" +
    "<tr><td><strong>Urgency</strong></td><td>" + esc(bloodRequest.urgency) + "</td></tr>" +
    "<tr><td><strong>Contact</strong></td><td>" + esc(bloodRequest.phone) + "</td></tr>" +
    "</table>" +
    "<p>Please respond in the <a href=\"" + esc(portalUrl()) + "\">volunteer portal</a> if you're able to help.</p>" +
    "<p>— Moonlit Foundation</p>";
  await sendEmailRaw(volunteer.email, "URGENT: Blood Request — " + bloodRequest.bloodGroup + " needed", text, html);
}

async function sendPasswordResetEmail(volunteer, resetUrl) {
  const text =
    "Hi " + volunteer.fullName + ",\n\n" +
    "We received a request to reset your Moonlit Foundation volunteer portal password.\n\n" +
    "Reset your password: " + resetUrl + "\n\n" +
    "This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will stay unchanged.\n\n" +
    "- Moonlit Foundation";
  const html =
    "<p>Hi " + esc(volunteer.fullName) + ",</p>" +
    "<p>We received a request to reset your Moonlit Foundation volunteer portal password.</p>" +
    "<p><a href=\"" + esc(resetUrl) + "\" style=\"background:#14338C;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block\">Reset Password</a></p>" +
    "<p style=\"font-size:13px;color:#4B5563\">Or copy this link: " + esc(resetUrl) + "</p>" +
    "<p style=\"font-size:13px;color:#4B5563\">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will stay unchanged.</p>" +
    "<p>— Moonlit Foundation</p>";
  await sendEmailRaw(volunteer.email, "Reset your Moonlit Foundation volunteer password", text, html);
}

module.exports = {
  sendApprovalEmail,
  sendApprovalSms,
  sendBloodAlertSms,
  sendBloodAlertEmail,
  sendPasswordResetEmail,
  bloodAlertText
};
