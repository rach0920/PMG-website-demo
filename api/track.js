import crypto from "node:crypto";

const SUPABASE_URL = "https://caqfpahfforgonprcxhd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcWZwYWhmZm9yZ29ucHJjeGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTA0NjQsImV4cCI6MjA5NzA4NjQ2NH0.jJLjEm2l6YDsSZTxC8c0qdRVqF68leOwoG7ayNvQ2VI";

function header(req, name) {
  return req.headers?.[name] || req.headers?.[name.toLowerCase()] || "";
}

function clientIp(req) {
  return String(header(req, "x-forwarded-for") || header(req, "x-real-ip") || "")
    .split(",")[0]
    .trim();
}

function safeDecode(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function ipHash(req) {
  const ip = clientIp(req);
  if (!ip) return "";
  const salt = process.env.ANALYTICS_HASH_SALT || SUPABASE_ANON_KEY.slice(0, 24);
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

function analyticsMetadata(req) {
  return {
    ip_address: clientIp(req),
    ip_hash: ipHash(req),
    country: String(header(req, "x-vercel-ip-country") || ""),
    region: safeDecode(header(req, "x-vercel-ip-country-region")),
    city: safeDecode(header(req, "x-vercel-ip-city")),
    user_agent: String(header(req, "user-agent") || "").slice(0, 500),
  };
}

async function insertPageView(row) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!response.ok) throw new Error(await response.text());
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body || {};
    await insertPageView({
      ...analyticsMetadata(req),
      path: String(body.path || "").slice(0, 400),
      referrer: String(body.referrer || "").slice(0, 500),
      screen: String(body.screen || "").slice(0, 60),
      language: String(body.language || "").slice(0, 40),
    });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(200).json({ ok: false });
  }
}
