const recipients = (process.env.NOTIFICATION_TO || "rachel@premiummg.com.au,edwin@premiummg.com.au")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const fromEmail = process.env.RESEND_FROM_EMAIL || "PMG Website <onboarding@resend.dev>";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowsFromObject(data) {
  return Object.entries(data || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
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
    const { type, payload } = req.body || {};
    const { subject, html } = buildEmail(type, payload);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        html,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      res.status(response.status).json(result);
      return;
    }

    res.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message || "Email failed" });
  }
}
