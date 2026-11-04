// GET  /api/brief-approve?id=&t=  A confirmation page (safe for email link scanners).
// POST /api/brief-approve          Sends the brief to the founder.
import { loadBrief, storeBrief, sendToFounder } from "../../scan/lib/notify.js";
import { markBriefSent } from "../../scan/lib/hq.js";

const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const page = (title, body, status = 200) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} · Kernel Lab</title>
<style>body{margin:0;background:#2F3F36;font-family:Helvetica,Arial,sans-serif;color:#23302A}main{max-width:560px;margin:40px auto;background:#FBF8EF;border-radius:12px;padding:28px}h1{font-family:Georgia,serif;font-weight:400;color:#3E5045;margin:0 0 10px}p{line-height:1.6;color:#4A564E}button,a.b{display:inline-block;background:#D2AA5A;color:#2F3F36;border:0;border-radius:30px;padding:13px 22px;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;cursor:pointer;text-decoration:none}.q{color:#3E5045}</style></head><body><main>${body}</main></body></html>`, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });

async function find(env, id, t) {
  const rec = await loadBrief(env, id);
  return rec && t && t === rec.approveToken ? rec : null;
}

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url); const id = u.searchParams.get("id"), t = u.searchParams.get("t");
  const rec = await find(env, id, t);
  if (!rec) return page("Not found", "<h1>Link not found</h1><p>This approval link has expired or isn&rsquo;t valid.</p>", 404);
  const preview = `/brief.html?id=${encodeURIComponent(id)}&t=${encodeURIComponent(t)}`;
  if (rec.status === "sent") return page("Already sent", `<h1>Already sent</h1><p>${esc(rec.brief.business)}&rsquo;s brief went to ${esc(rec.input.email)} on ${esc((rec.sentAt || "").slice(0, 10))}.</p><p><a class="q" href="${preview}">View the brief</a></p>`);
  return page("Review and send", `<h1>${esc(rec.brief.business)}</h1><p>${rec.brief.opportunities.length} opportunities for ${esc(rec.input.name || "this founder")} (${esc(rec.input.email || "no email")}).</p>
<p><a class="q" href="${preview}" target="_blank" rel="noopener">Read the full brief first</a></p>
<form method="post"><input type="hidden" name="id" value="${esc(id)}"><input type="hidden" name="t" value="${esc(t)}"><button type="submit">Send to ${esc(rec.input.email || "founder")}</button></form>
<p style="font-size:13px;margin-top:18px">Want to change something first? Don&rsquo;t send. Reply to the founder yourself with your edited version.</p>`);
}

export async function onRequestPost({ request, env }) {
  const f = await request.formData(); const id = f.get("id"), t = f.get("t");
  const rec = await find(env, id, t);
  if (!rec) return page("Not found", "<h1>Link not found</h1><p>This approval link has expired or isn&rsquo;t valid.</p>", 404);
  if (rec.status !== "sent") {
    const ok = await sendToFounder(env, { id, record: rec });
    if (!ok) return page("Not sent", "<h1>Couldn&rsquo;t send</h1><p>The email service didn&rsquo;t accept the message. Nothing was sent; try again in a moment.</p>", 502);
    rec.status = "sent"; rec.sentAt = new Date().toISOString();
    await storeBrief(env, id, rec);
    await markBriefSent(env, id, "email link").catch(() => {});
  }
  return page("Sent", `<h1>Sent</h1><p>${esc(rec.brief.business)}&rsquo;s brief is on its way to ${esc(rec.input.email)}.</p>`);
}
