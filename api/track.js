import crypto from "node:crypto";

const SUPABASE_URL = "https://caqfpahfforgonprcxhd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcWZwYWhmZm9yZ29ucHJjeGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTA0NjQsImV4cCI6MjA5NzA4NjQ2NH0.jJLjEm2l6YDsSZTxC8c0qdRVqF68leOwoG7ayNvQ2VI";
const SUPABASE_SERVER_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const defaultBlockedMessage =
  "Access to this website or submission service has been restricted. Please contact Premium Management Group directly.";

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

function normalize(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizePhone(value) {
  return String(value || "").replace(/[^\d+]/g, "");
}

function payloadValue(body, keys) {
  for (const key of keys) {
    if (body?.[key]) return body[key];
    if (body?.payload?.[key]) return body.payload[key];
  }
  return "";
}

function candidateValues(req, body = {}) {
  return {
    ip: clientIp(req),
    email: normalize(payloadValue(body, ["Email", "email"])),
    phone: normalizePhone(payloadValue(body, ["Phone", "phone"])),
    name: normalize(payloadValue(body, ["Name", "name"])),
    address: normalize(payloadValue(body, ["Property Address", "property", "property_address", "address"])),
  };
}

async function getBlockedVisitors() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/blocked_visitors?select=match_type,value,message,reason,is_active&is_active=eq.true`,
    {
      headers: {
        apikey: SUPABASE_SERVER_KEY,
        Authorization: `Bearer ${SUPABASE_SERVER_KEY}`,
      },
    }
  );
  if (!response.ok) return [];
  return response.json();
}

async function blockedVisitor(req, body) {
  const candidates = candidateValues(req, body);
  const rules = await getBlockedVisitors();
  return rules.find((rule) => {
    const type = normalize(rule.match_type);
    const ruleValue = type === "phone" ? normalizePhone(rule.value) : normalize(rule.value);
    if (!type || !ruleValue) return false;
    return candidates[type] && candidates[type] === ruleValue;
  });
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
    const blocked = await blockedVisitor(req, body);
    if (blocked) {
      res.status(200).json({
        ok: false,
        blocked: true,
        message: blocked.message || defaultBlockedMessage,
      });
      return;
    }

    if (body.action === "check-block") {
      res.status(200).json({ ok: true, blocked: false });
      return;
    }

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
