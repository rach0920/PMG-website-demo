import crypto from "node:crypto";
import dns from "node:dns/promises";

const recipients = (process.env.NOTIFICATION_TO || "rachel@premiummg.com.au,edwin@premiummg.com.au")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);
const applicationRecipients = (process.env.APPLICATION_TO || "rachel@premiummg.com.au")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const fromEmail = process.env.RESEND_FROM_EMAIL || "PMG Website <onboarding@resend.dev>";
const verificationStore = (globalThis.__pmgEmailVerificationStore ||= new Map());
const verificationTtlMs = 10 * 60 * 1000;
const disposableDomains = new Set([
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
]);

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowsFromObject(data) {
  return Object.entries(data || {})
    .filter(([key, value]) => key !== "_attachments" && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const displayValue = typeof value === "object" ? JSON.stringify(value, null, 2) : value;
      return `
        <tr>
          <th align="left" style="padding:10px;border-bottom:1px solid #e5e5e5;color:#555;width:190px;">${escapeHtml(key)}</th>
          <td style="padding:10px;border-bottom:1px solid #e5e5e5;color:#111;white-space:pre-wrap;">${escapeHtml(displayValue)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildEmail(type, payload) {
  const titles = {
    enquiry: "New Website Enquiry",
    promotion: "New Promotion Code Claim",
    application: "New Tenant Application",
  };

  const title = titles[type] || "New Website Notification";
  const subject = `PMG Website: ${title}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:720px;margin:0 auto;color:#111;">
      <h1 style="font-size:24px;margin:0 0 12px;">${escapeHtml(title)}</h1>
      <p style="margin:0 0 20px;color:#555;">A new submission has been received from the Premium Management Group website.</p>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border-top:1px solid #e5e5e5;">
        ${rowsFromObject(payload)}
      </table>
    </div>
  `;

  return { subject, html };
}

function getReplyTo(payload) {
  return payload?.Email || payload?.email || payload?.["Email Address"] || undefined;
}

function getAttachments(payload) {
  if (!Array.isArray(payload?._attachments)) return [];
  return payload._attachments
    .filter((file) => file?.filename && file?.content)
    .map((file) => ({
      filename: file.filename,
      content: file.content,
    }));
}

function normaliseEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function verificationKey(email) {
  return crypto.createHash("sha256").update(normaliseEmail(email)).digest("hex");
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code || "")).digest("hex");
}

function pruneExpiredVerifications() {
  const now = Date.now();
  for (const [key, value] of verificationStore.entries()) {
    if (!value?.expiresAt || value.expiresAt < now) verificationStore.delete(key);
  }
}

async function hasMailServer(email) {
  const domain = normaliseEmail(email).split("@")[1];
  if (!domain || disposableDomains.has(domain)) return false;
  try {
    const mx = await dns.resolveMx(domain);
    if (mx?.length) return true;
  } catch {
    // Some domains accept mail at their A record even without published MX.
  }
  try {
    const addresses = await dns.resolve(domain);
    return Boolean(addresses?.length);
  } catch {
    return false;
  }
}

function hasSpamTrap(payload) {
  return Boolean(payload?.website || payload?.Website);
}

async function sendResendEmail(message) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result?.message || result?.error || "Email failed");
    error.status = response.status;
    error.result = result;
    throw error;
  }
  return result;
}

async function requestEnquiryVerification(payload) {
  if (hasSpamTrap(payload)) return { ok: true };
  const email = normaliseEmail(payload?.Email || payload?.email);
  if (!isValidEmail(email)) {
    const error = new Error("Please enter a valid email address.");
    error.status = 400;
    throw error;
  }
  if (!(await hasMailServer(email))) {
    const error = new Error("This email domain cannot receive mail. Please use a valid email address.");
    error.status = 400;
    throw error;
  }

  pruneExpiredVerifications();
  const code = String(crypto.randomInt(100000, 999999));
  verificationStore.set(verificationKey(email), {
    codeHash: hashCode(code),
    expiresAt: Date.now() + verificationTtlMs,
    attempts: 0,
  });

  await sendResendEmail({
    from: fromEmail,
    to: [email],
    subject: "Your PMG enquiry verification code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#111;">
        <h1 style="font-size:22px;margin:0 0 12px;">Premium Management Group</h1>
        <p>Please use the verification code below to submit your enquiry.</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:24px 0;">${code}</p>
        <p style="color:#666;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return { ok: true, verificationRequired: true };
}

function verifyEnquiryCode(email, code) {
  pruneExpiredVerifications();
  const key = verificationKey(email);
  const record = verificationStore.get(key);
  if (!record) {
    const error = new Error("Verification code has expired. Please request a new code.");
    error.status = 400;
    throw error;
  }
  record.attempts += 1;
  if (record.attempts > 5) {
    verificationStore.delete(key);
    const error = new Error("Too many verification attempts. Please request a new code.");
    error.status = 429;
    throw error;
  }
  if (record.codeHash !== hashCode(code)) {
    const error = new Error("Verification code is incorrect.");
    error.status = 400;
    throw error;
  }
  verificationStore.delete(key);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    res.status(500).json({ error: "Missing RESEND_API_KEY" });
    return;
  }

  try {
    const { action, type, payload, code } = req.body || {};

    if (action === "request-enquiry-verification") {
      res.status(200).json(await requestEnquiryVerification(payload));
      return;
    }

    if (type === "enquiry") {
      if (hasSpamTrap(payload)) {
        res.status(200).json({ ok: true });
        return;
      }
      const email = normaliseEmail(payload?.Email || payload?.email);
      if (!isValidEmail(email)) {
        res.status(400).json({ error: "Please enter a valid email address." });
        return;
      }
      verifyEnquiryCode(email, code);
    }

    const { subject, html } = buildEmail(type, payload);
    const replyTo = getReplyTo(payload);
    const attachments = getAttachments(payload);

    const result = await sendResendEmail({
      from: fromEmail,
      to: type === "application" ? applicationRecipients : recipients,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments.length ? { attachments } : {}),
      subject,
      html,
    });

    res.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    res.status(error.status || 500).json(error.result || { error: error.message || "Email failed" });
  }
}
