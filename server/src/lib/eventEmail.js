const nodemailer = require("nodemailer");
const { createHash } = require("node:crypto");

const AUDIENCES = new Set(["volunteers", "registrations"]);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const emailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
const activeEvents = new Set();
const requests = new Map();

function safeUrl(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}

function validateShare({ audience = "volunteers", subject, message = "", requestId }) {
  if (!AUDIENCES.has(audience)) throw fail("Choose approved volunteers or event attendees.");
  if (subject !== undefined && (typeof subject !== "string" || !subject.trim() || subject.length > 180 || /[\r\n]/.test(subject))) throw fail("Subject must be a single line of 1–180 characters.");
  if (typeof message !== "string" || message.length > 3000) throw fail("Your message must be 3,000 characters or less.");
  if (typeof requestId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) throw fail("A valid email request ID is required.");
  return { audience, subject: subject?.trim(), message: message.trim(), requestId };
}

async function recipientsFor(prisma, eventId, audience) {
  if (!AUDIENCES.has(audience)) throw fail("Invalid email audience.");
  const rows = audience === "volunteers"
    ? await prisma.volunteer.findMany({ where: { status: "approved" }, select: { email: true } })
    : await prisma.eventRegistration.findMany({ where: { eventId, status: { in: ["pending", "confirmed"] } }, select: { email: true } });
  const recipients = new Set();
  let skipped = 0;
  for (const row of rows) {
    const email = String(row.email || "").trim().toLowerCase();
    if (!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(email)) { skipped++; continue; }
    recipients.add(email);
  }
  return { recipients: [...recipients], skipped };
}

function buildEventEmail(event, { subject, message = "" } = {}) {
  const site = safeUrl(process.env.SITE_URL || process.env.PORTAL_URL || "http://localhost:5173");
  if (!site) throw fail("The website URL is not configured correctly.", 503);
  const link = new URL(`/events#event-${encodeURIComponent(event.id)}`, site).href;
  const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(event.eventDate));
  const when = `${date} · ${event.startTime} – ${event.endTime}`;
  const image = safeUrl(event.imageUrl);
  const title = subject || `You're invited: ${event.title}`;
  const text = ["Moonlit Foundation", event.title, message, when, event.location, event.description, `View event: ${link}`, "Together, we can make a difference."].filter(Boolean).join("\n\n");
  const html = `<div style="background:#f8f9f5;padding:32px 12px;font-family:Arial,sans-serif;color:#0a1f44"><div style="max-width:580px;margin:auto;background:#fff;border-radius:16px;overflow:hidden"><div style="background:#0a1f44;color:#f5b921;padding:24px 28px;font-size:22px;font-weight:bold">moonlit <span style="font-size:10px;letter-spacing:2px;color:#fff">FOUNDATION</span></div>${image ? `<img src="${esc(image)}" alt="${esc(event.title)}" width="580" style="display:block;width:100%;max-height:300px;object-fit:cover" />` : ""}<div style="padding:28px"><p style="font-size:11px;letter-spacing:2px;color:#69765e">${esc(event.category)}</p><h1 style="font-size:28px;line-height:1.2">${esc(event.title)}</h1>${message ? `<p style="line-height:1.8;white-space:pre-wrap">${esc(message)}</p>` : ""}<p style="line-height:1.8"><strong>${esc(when)}</strong><br />${esc(event.location)}</p><p style="color:#5f6d56;line-height:1.8;white-space:pre-wrap">${esc(event.description)}</p><a href="${esc(link)}" style="display:inline-block;margin-top:12px;background:#f5b921;color:#0a1f44;border-radius:8px;text-decoration:none;padding:14px 23px;font-weight:bold">View event &amp; get involved →</a><p style="margin-top:30px;font-size:11px;color:#76816c">You're receiving this event update as a Moonlit volunteer or registered attendee.<br />Together, we can make a difference.</p></div></div></div>`;
  return { subject: title, text, html };
}

// One envelope per person: recipient addresses are never exposed to each other.
// Bounded concurrency avoids opening an SMTP connection for every volunteer at once.
async function deliverEventEmail(event, options, recipients, transporter) {
  const content = buildEventEmail(event, options);
  let cursor = 0, sent = 0;
  const failures = [];
  async function worker() {
    while (cursor < recipients.length) {
      const to = recipients[cursor++];
      try {
        const result = await transporter.sendMail({ from: { name: "Moonlit Foundation", address: process.env.GMAIL_USER }, to, ...content });
        if (!result.accepted?.length) throw new Error("Recipient was not accepted.");
        sent++;
      } catch {
        // Never expose SMTP credentials, raw errors or recipient addresses in the response.
        failures.push(to);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, recipients.length) }, worker));
  return { sent, failed: failures.length, total: recipients.length, status: failures.length ? (sent ? "partial" : "failed") : "sent" };
}

async function shareEvent(prisma, event, rawOptions, createTransport = nodemailer.createTransport) {
  if (event.status !== "published") throw fail("Publish this event before sharing it by email.");
  const options = validateShare(rawOptions);
  const key = `${event.id}:${options.requestId}`;
  const fingerprint = createHash("sha256").update(JSON.stringify(options)).digest("hex");
  for (const [id, value] of requests) if (value.expires < Date.now()) requests.delete(id);
  const previous = requests.get(key);
  if (previous) {
    if (previous.fingerprint !== fingerprint) throw fail("This email request has already been used. Reopen the email composer to send a new message.", 409);
    return previous.promise;
  }
  if (activeEvents.has(event.id)) throw fail("An email for this event is already sending. Please wait for it to finish.", 409);
  if (!emailConfigured()) throw fail("Email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD on the server.", 503);
  activeEvents.add(event.id);
  const promise = (async () => {
    const { recipients, skipped } = await recipientsFor(prisma, event.id, options.audience);
    if (!recipients.length) return { status: "empty", total: 0, sent: 0, failed: 0, skipped };
    const transporter = createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 30000 });
    try { return { ...await deliverEventEmail(event, options, recipients, transporter), skipped }; }
    finally { transporter.close?.(); }
  })().finally(() => activeEvents.delete(event.id));
  // Idempotent retries in this process for 30 minutes; clients do not auto-retry sends.
  requests.set(key, { promise, fingerprint, expires: Infinity });
  try {
    const result = await promise;
    requests.set(key, { promise: Promise.resolve(result), fingerprint, expires: Date.now() + 30 * 60 * 1000 });
    return result;
  } catch (error) { requests.delete(key); throw error; }
}

module.exports = { emailConfigured, recipientsFor, buildEventEmail, deliverEventEmail, shareEvent, validateShare, safeUrl };
