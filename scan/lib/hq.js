// Kernel HQ: a small CRM for leads from the Opportunity Scan, the inquiry forms,
// and anything added by hand. Leads live in the same KV namespace as scans.
// Access: /hq and /api/hq sit behind Cloudflare Access; every API call also
// verifies the Access token here, so the API fails closed if Access is off.

export const STAGES = [
  ["new", "New"], ["sent", "Brief sent"], ["call", "Follow-up call"], ["discovery", "Discovery"],
  ["lab1", "Lab: we drive"], ["lab2", "Lab: you drive"], ["handoff", "Hand-off"], ["alumni", "Alumni"],
  ["nofit", "Not a fit"], ["paused", "Paused"],
];
const STAGE_IDS = STAGES.map((s) => s[0]);
const SOURCES = ["scan", "lab-inquiry", "core-inquiry", "contact", "referral", "manual"];
const KEY = (id) => `lead:${id}`;
const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export function newLead(fields = {}) {
  const now = new Date().toISOString();
  return sanitize({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, stage: "new", notes: [], ...fields });
}

/** Keep a lead to a known shape whatever was sent. */
export function sanitize(l) {
  return {
    id: l.id, createdAt: l.createdAt, updatedAt: l.updatedAt || l.createdAt,
    stage: STAGE_IDS.includes(l.stage) ? l.stage : "new",
    source: SOURCES.includes(l.source) ? l.source : "manual",
    name: clip(l.name, 120), email: clip(l.email, 200), phone: clip(l.phone, 40),
    business: clip(l.business, 120), website: clip(l.website, 200), location: clip(l.location, 120),
    room: clip(l.room, 120), stuck: clip(l.stuck, 1200), operations: clip(l.operations, 600),
    admire: clip(l.admire, 400), tools: clip(l.tools, 300), team: clip(l.team, 200),
    message: clip(l.message, 3000), interested: (Array.isArray(l.interested) ? l.interested : []).map((x) => clip(x, 160)).filter(Boolean).slice(0, 12),
    briefId: /^[a-f0-9-]{36}$/.test(l.briefId || "") ? l.briefId : "",
    briefStatus: ["pending", "sent", ""].includes(l.briefStatus) ? l.briefStatus : "",
    nextStep: { text: clip(l.nextStep && l.nextStep.text, 200), due: /^\d{4}-\d{2}-\d{2}$/.test((l.nextStep && l.nextStep.due) || "") ? l.nextStep.due : "" },
    tags: (Array.isArray(l.tags) ? l.tags : []).map((t) => clip(t, 40)).filter(Boolean).slice(0, 10),
    notes: (Array.isArray(l.notes) ? l.notes : []).filter((n) => n && n.text).slice(-200).map((n) => ({ at: n.at || new Date().toISOString(), by: clip(n.by, 120), kind: ["note", "stage", "email", "ai", "system"].includes(n.kind) ? n.kind : "note", text: clip(n.text, 6000) })),
  };
}

export async function getLead(env, id) {
  if (!env.SCAN_KV || !/^[a-f0-9-]{36}$/.test(id || "")) return null;
  const v = await env.SCAN_KV.get(KEY(id)); return v ? JSON.parse(v) : null;
}
export async function putLead(env, lead) {
  lead.updatedAt = new Date().toISOString();
  const clean = sanitize(lead);
  // List metadata lets the board load without reading every lead.
  const meta = { n: clean.name, b: clean.business, s: clean.stage, src: clean.source, u: clean.updatedAt, d: clean.nextStep.due, bs: clean.briefStatus, br: clean.briefId, e: clean.email, nx: clean.nextStep.text.slice(0, 80) };
  await env.SCAN_KV.put(KEY(clean.id), JSON.stringify(clean), { metadata: meta });
  return clean;
}
export async function listLeads(env) {
  const out = []; let cursor;
  do {
    const r = await env.SCAN_KV.list({ prefix: "lead:", cursor, limit: 1000 });
    r.keys.forEach((k) => out.push({ id: k.name.slice(5), ...(k.metadata || {}) }));
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  return out;
}

/** Called by the scan when a brief is ready. Reuses an open lead with the same email. */
export async function leadFromScan(env, { briefId, input, brief, status }) {
  if (!env.SCAN_KV) return null;
  const lead = newLead({ source: "scan" });
  Object.assign(lead, {
    name: input.name, email: input.email, website: input.website, business: (brief && brief.business) || input.website || "",
    room: input.room === "Other" ? input.room_other : input.room, stuck: input.stuck, operations: input.operations,
    admire: input.admire, tools: input.tools, team: input.team, location: input.location,
    briefId, briefStatus: status,
  });
  lead.notes = (lead.notes || []).concat({ at: new Date().toISOString(), kind: "system", text: `Opportunity Scan finished: ${(brief && brief.opportunities && brief.opportunities.length) || 0} opportunities. Brief ${status === "sent" ? "shown to the founder" : "waiting for review"}.` });
  return putLead(env, lead);
}

export async function markBriefSent(env, briefId, by) {
  if (!env.SCAN_KV) return;
  const all = await listLeads(env);
  for (const m of all.filter((x) => x.br === briefId)) {
    const lead = await getLead(env, m.id);
    if (lead && lead.briefId === briefId) {
      lead.briefStatus = "sent";
      if (lead.stage === "new") lead.stage = "sent";
      lead.notes.push({ at: new Date().toISOString(), kind: "email", by: by || "", text: "Brief sent to " + (lead.email || "the founder") + "." });
      await putLead(env, lead);
    }
  }
}

/* ---------- Cloudflare Access ---------- */
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));
let certCache = { at: 0, keys: [] };

/** Returns the signed-in email, or null. Requires ACCESS_TEAM_DOMAIN and ACCESS_AUD. */
export async function accessUser(request, env, fetchImpl = fetch) {
  return (await accessCheck(request, env, fetchImpl)).email;
}

// Same check, but says why it failed so HQ can show a useful message.
export async function accessCheck(request, env, fetchImpl = fetch) {
  const no = (reason, email) => ({ email: null, reason, seen: email || null });
  if (env.HQ_DEV_USER && env.HQ_DEV_ALLOW === "true") return { email: env.HQ_DEV_USER }; // local testing only
  const team = (env.ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const aud = env.ACCESS_AUD || "";
  if (!team || !aud) return no("not_configured");
  const jwt = request.headers.get("cf-access-jwt-assertion") || (request.headers.get("cookie") || "").match(/CF_Authorization=([^;]+)/)?.[1];
  if (!jwt) return no("no_signin");
  const [h, p, s] = jwt.split(".");
  if (!h || !p || !s) return no("bad_token");
  let header, payload;
  try { header = JSON.parse(new TextDecoder().decode(b64u(h))); payload = JSON.parse(new TextDecoder().decode(b64u(p))); } catch (e) { return no("bad_token"); }
  if (Date.now() - certCache.at > 3600e3 || !certCache.keys.length) {
    const r = await fetchImpl(`https://${team}/cdn-cgi/access/certs`); const j = await r.json();
    certCache = { at: Date.now(), keys: j.keys || [] };
  }
  const jwk = certCache.keys.find((k) => k.kid === header.kid);
  if (!jwk) return no("bad_token");
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64u(s), new TextEncoder().encode(h + "." + p));
  if (!ok) return no("bad_token");
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(aud) || payload.iss !== `https://${team}`) return no("wrong_app");
  if (payload.exp && payload.exp * 1000 < Date.now()) return no("expired");
  const email = String(payload.email || "").toLowerCase();
  const allow = (env.HQ_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (allow.length && !allow.includes(email)) return no("not_allowed", email);
  return { email: payload.email || null, reason: payload.email ? undefined : "bad_token" };
}
