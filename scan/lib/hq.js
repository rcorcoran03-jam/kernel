// Kernel HQ: a small CRM for leads from the Opportunity Scan, the inquiry forms,
// and anything added by hand. Leads live in the same KV namespace as scans.
// Access: /hq and /api/hq sit behind Cloudflare Access; every API call also
// verifies the Access token here, so the API fails closed if Access is off.

export const STAGES = [
  ["new", "New"], ["sent", "Brief sent"], ["call", "Follow-up call"], ["negotiation", "In negotiation"], ["signed", "Contract signed"], ["discovery", "Discovery"],
  ["lab1", "Lab: we drive"], ["lab2", "Lab: you drive"], ["handoff", "Hand-off"], ["alumni", "Alumni"],
  ["nofit", "Not a fit"], ["paused", "Paused"],
];
const STAGE_IDS = STAGES.map((s) => s[0]);
// The forward path, in order. "Not a fit" and "Paused" are exits, not steps.
export const PATH = STAGE_IDS.filter((s) => s !== "nofit" && s !== "paused");
const BY_LABEL = Object.fromEntries(STAGES.map(([id, l]) => [l, id]));

/** The furthest stage on the path a lead has reached, so the dashboard can show where deals stop. */
export function furthestStage(l) {
  let best = PATH.indexOf(l.furthest);
  const see = (id) => { const i = PATH.indexOf(id); if (i > best) best = i; };
  see(l.stage);
  (l.notes || []).forEach((n) => { const m = n && n.kind === "stage" && /^Moved from (.+) to (.+)\.$/.exec(n.text || ""); if (m) { see(BY_LABEL[m[1]]); see(BY_LABEL[m[2]]); } });
  return PATH[Math.max(best, 0)];
}
const SOURCES = ["scan", "lab-inquiry", "core-inquiry", "contact", "referral", "manual"];
const KEY = (id) => `lead:${id}`;
const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/* ---------- Proposal: fixed Discovery + fixed Lab + a Teach one bonus scored on agreed targets ---------- */
const num = (v) => (v === "" || v == null || !isFinite(Number(v)) ? null : Math.round(Number(v) * 100) / 100);
const money = (v) => Math.max(0, Math.min(1e6, Math.round(Number(v) || 0)));
export function cleanProposal(p) {
  if (!p || typeof p !== "object") return null;
  return {
    status: ["draft", "sent", "accepted", "reviewed"].includes(p.status) ? p.status : "draft",
    discovery: money(p.discovery), credit: !!p.credit, lab: money(p.lab),
    reviewDays: Math.max(0, Math.min(365, Math.round(Number(p.reviewDays) || 60))),
    handoff: /^\d{4}-\d{2}-\d{2}$/.test(p.handoff || "") ? p.handoff : "",
    targets: (Array.isArray(p.targets) ? p.targets : []).slice(0, 8).map((t) => ({
      label: clip(t.label, 120), unit: clip(t.unit, 30), source: clip(t.source, 120),
      kind: t.kind === "done" ? "done" : "number",
      baseline: num(t.baseline), target: num(t.target), actual: num(t.actual), done: !!t.done,
      amount: money(t.amount),
    })),
  };
}
/** Score one target: full when the target is reached, half when it gets at least halfway from the baseline. */
export function scoreTarget(t) {
  if (t.kind === "done") return t.done ? { level: "met", pay: t.amount } : { level: "open", pay: 0 };
  if (t.actual == null || t.baseline == null || t.target == null || t.target === t.baseline) return { level: "open", pay: 0 };
  const progress = (t.actual - t.baseline) / (t.target - t.baseline);
  if (progress >= 1) return { level: "met", pay: t.amount };
  if (progress >= 0.5) return { level: "half", pay: Math.round(t.amount / 2) };
  return { level: "missed", pay: 0 };
}
export function proposalTotals(p) {
  if (!p) return null;
  const fixed = p.lab + (p.credit ? 0 : p.discovery);
  const maxBonus = p.targets.reduce((a, t) => a + t.amount, 0);
  const earned = p.targets.reduce((a, t) => a + scoreTarget(t).pay, 0);
  return { fixed, maxBonus, earned, min: fixed, max: fixed + maxBonus, total: fixed + earned };
}

export function newLead(fields = {}) {
  const now = new Date().toISOString();
  return sanitize({ id: crypto.randomUUID(), createdAt: now, updatedAt: now, stage: "new", notes: [], ...fields });
}

/** Keep a lead to a known shape whatever was sent. */
export function sanitize(l) {
  return {
    id: l.id, createdAt: l.createdAt, updatedAt: l.updatedAt || l.createdAt,
    stage: STAGE_IDS.includes(l.stage) ? l.stage : "new",
    furthest: PATH.includes(l.furthest) ? l.furthest : "",
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
    proposal: cleanProposal(l.proposal),
    notes: (Array.isArray(l.notes) ? l.notes : []).filter((n) => n && n.text).slice(-200).map((n) => ({ at: n.at || new Date().toISOString(), by: clip(n.by, 120), kind: ["note", "stage", "email", "ai", "system"].includes(n.kind) ? n.kind : "note", text: clip(n.text, 6000) })),
  };
}

export async function getLead(env, id) {
  if (!env.SCAN_KV || !/^[a-f0-9-]{36}$/.test(id || "")) return null;
  const v = await env.SCAN_KV.get(KEY(id)); return v ? JSON.parse(v) : null;
}
export async function putLead(env, lead) {
  lead.updatedAt = new Date().toISOString();
  lead.furthest = furthestStage(lead);
  const clean = sanitize(lead);
  // List metadata lets the board load without reading every lead.
  const meta = { n: clean.name, b: clean.business, s: clean.stage, src: clean.source, u: clean.updatedAt, d: clean.nextStep.due, bs: clean.briefStatus, br: clean.briefId, e: clean.email, nx: clean.nextStep.text.slice(0, 80), c: clean.createdAt, f: clean.furthest, t: clean.tags.slice(0, 4) };
  const pt = proposalTotals(clean.proposal);
  if (pt) meta.p = [pt.min, pt.max, pt.earned, clean.proposal.status];
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

/** An existing lead with this email that's still in play, so repeat visitors don't become duplicates. */
export async function findOpenLead(env, email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e || !env.SCAN_KV) return null;
  const m = (await listLeads(env)).filter((x) => (x.e || "").toLowerCase() === e && x.s !== "nofit").sort((a, b) => (b.u || "").localeCompare(a.u || ""))[0];
  return m ? getLead(env, m.id) : null;
}
const SOURCE_NAMES = { scan: "Lab scan", "lab-inquiry": "Lab inquiry", "core-inquiry": "Suite inquiry", contact: "General inquiry" };
export const sourceName = (k) => SOURCE_NAMES[k] || k;

/** Called by the scan when a brief is ready. Reuses an open lead with the same email. */
export async function leadFromScan(env, { briefId, input, brief, status }) {
  if (!env.SCAN_KV) return null;
  const found = await findOpenLead(env, input.email);
  const lead = found || newLead({ source: "scan" });
  const fill = {
    name: input.name, email: input.email, website: input.website, business: (brief && brief.business) || input.website || "",
    room: input.room === "Other" ? input.room_other : input.room, stuck: input.stuck, operations: input.operations,
    admire: input.admire, tools: input.tools, team: input.team, location: input.location,
  };
  // Keep anything already on file; the scan fills the gaps.
  Object.keys(fill).forEach((k) => { if (fill[k] && (!found || !lead[k])) lead[k] = fill[k]; });
  lead.briefId = briefId; lead.briefStatus = status;
  if (found && found.source !== "scan") lead.tags = Array.from(new Set((lead.tags || []).concat("Lab scan")));
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
