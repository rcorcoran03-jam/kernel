// Kernel HQ API. GET lists leads; POST { action, ... } changes them.
// Protected twice: Cloudflare Access in front, and a token check here.
import { STAGES, newLead, getLead, putLead, listLeads, accessCheck, markBriefSent } from "../../scan/lib/hq.js";
import { loadBrief, storeBrief, sendToFounder } from "../../scan/lib/notify.js";
import { callClaude } from "../../scan/lib/claude.js";
import { json } from "../../scan/lib/jobs.js";

const PREP_SYSTEM = `You help Kernel Collective, a Minneapolis consultancy for founder-led small businesses, prepare for a free 30-minute follow-up call after an Opportunity Scan. Write in plain, warm language. No em dashes. Return short markdown with these headings: Who they are (2 lines), What they told us (bullets), Where we'd start (the two or three strongest ideas, one line each, with the first experiment), Questions to ask (5 to 7, open-ended, to validate the brief), Watch for (2 or 3 risks or sensitivities). Use only the lead record and brief you are given. Do not invent facts.`;
const FOLLOWUP_SYSTEM = `You draft short emails for Kernel Collective, a Minneapolis consultancy for founder-led small businesses, in the voice of the person sending it. Warm, plain, specific, under 140 words. No em dashes, no hype, no pressure. Use only the lead record, brief, and notes you are given. Return only the email: a subject line starting with "Subject:", a blank line, then the body, signed with the sender's first name.`;

async function authed(request, env) {
  const c = await accessCheck(request, env).catch(() => ({ email: null, reason: "bad_token" }));
  const user = c.email;
  if (!user) return [null, json({ status: "error", reason: c.reason, seen: c.seen, message: "Sign in through Kernel HQ to continue." }, 401)];
  if (!env.SCAN_KV) return [null, json({ status: "error", message: "Storage isn't connected." }, 503)];
  return [user, null];
}

export async function onRequestGet({ request, env }) {
  const [user, fail] = await authed(request, env); if (fail) return fail;
  const u = new URL(request.url);
  if (u.searchParams.get("id")) {
    const lead = await getLead(env, u.searchParams.get("id"));
    if (!lead) return json({ status: "error", message: "Lead not found." }, 404);
    let brief = null;
    if (lead.briefId) { const rec = await loadBrief(env, lead.briefId); if (rec) brief = { brief: rec.brief, status: rec.status, approveToken: rec.approveToken, sentAt: rec.sentAt || "" }; }
    return json({ status: "ok", lead, brief, user });
  }
  return json({ status: "ok", user, stages: STAGES, leads: await listLeads(env) });
}

export async function onRequestPost({ request, env }) {
  const [user, fail] = await authed(request, env); if (fail) return fail;
  let b; try { b = await request.json(); } catch (e) { return json({ status: "error", message: "Couldn't read the request." }, 400); }
  const now = () => new Date().toISOString();

  if (b.action === "create") {
    const lead = newLead({ ...b.lead, source: (b.lead && b.lead.source) || "manual" });
    lead.notes.push({ at: now(), by: user, kind: "system", text: "Added by hand." });
    return json({ status: "ok", lead: await putLead(env, lead) });
  }

  const lead = await getLead(env, b.id);
  if (!lead) return json({ status: "error", message: "Lead not found." }, 404);

  if (b.action === "update") {
    const f = b.fields || {};
    const before = lead.stage;
    ["name", "email", "phone", "business", "website", "location", "room", "stuck", "operations", "admire", "tools", "team", "tags", "nextStep", "stage", "proposal"].forEach((k) => { if (k in f) lead[k] = f[k]; });
    const label = (id) => (STAGES.find((s) => s[0] === id) || [id, id])[1];
    if ("proposal" in f && f.proposal && (!lead.notes.some((n) => n.kind === "system" && /^Proposal started/.test(n.text)))) lead.notes.push({ at: now(), by: user, kind: "system", text: "Proposal started." });
    if (f.stage && f.stage !== before) lead.notes.push({ at: now(), by: user, kind: "stage", text: `Moved from ${label(before)} to ${label(f.stage)}.` });
    return json({ status: "ok", lead: await putLead(env, lead) });
  }

  if (b.action === "note") {
    if (!b.text || !String(b.text).trim()) return json({ status: "error", message: "Write a note first." }, 400);
    lead.notes.push({ at: now(), by: user, kind: b.kind === "email" ? "email" : "note", text: String(b.text).slice(0, 6000) });
    return json({ status: "ok", lead: await putLead(env, lead) });
  }

  if (b.action === "send-brief") {
    const rec = lead.briefId && (await loadBrief(env, lead.briefId));
    if (!rec) return json({ status: "error", message: "This lead has no brief." }, 400);
    if (rec.status !== "sent") {
      const ok = await sendToFounder(env, { id: lead.briefId, record: rec });
      if (!ok) return json({ status: "error", message: "The email service didn't accept the message. Nothing was sent." }, 502);
      rec.status = "sent"; rec.sentAt = now(); await storeBrief(env, lead.briefId, rec);
      await markBriefSent(env, lead.briefId, user);
    }
    return json({ status: "ok", lead: await getLead(env, lead.id) });
  }

  if (b.action === "ai") {
    const rec = lead.briefId ? await loadBrief(env, lead.briefId) : null;
    const context = JSON.stringify({ lead: { ...lead, notes: lead.notes.slice(-15) }, brief: rec ? rec.brief : null, sender: user }, null, 1).slice(0, 60000);
    const system = b.task === "followup" ? FOLLOWUP_SYSTEM : PREP_SYSTEM;
    const ask = b.task === "followup" ? `Draft a follow-up email for this lead. ${b.prompt ? "Guidance from the sender: " + String(b.prompt).slice(0, 500) : "Invite them to book the free follow-up call if they haven't, or recap and suggest one next step if they have."}` : "Prepare me for the follow-up call.";
    try {
      const r = await callClaude({ env, model: env.HQ_MODEL || env.SCAN_MODEL || "claude-sonnet-5-5", system, user: `${ask}\n\n${context}`, maxTokens: 2000 });
      lead.notes.push({ at: now(), by: user, kind: "ai", text: (b.task === "followup" ? "Draft follow-up:\n" : "Call prep:\n") + r.text.trim() });
      return json({ status: "ok", text: r.text.trim(), lead: await putLead(env, lead) });
    } catch (e) { console.error("hq ai failed", e.message); return json({ status: "error", message: "Claude didn't respond. Try again in a moment." }, 502); }
  }

  return json({ status: "error", message: "Unknown action." }, 400);
}
