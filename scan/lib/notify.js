// Human review: store the brief, email Kernel a branded copy with an approve
// link, and (after approval) email the founder a private link to their brief.
// Email uses Resend (https://resend.com) when RESEND_API_KEY is set.

const SITE = (env) => (env.SITE_URL || "https://kernel-collective.com").replace(/\/$/, "");
const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dots = (n, fill) => [1, 2, 3].map((i) => `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:3px;border:1.5px solid ${fill};${i <= n ? `background:${fill};` : ""}"></span>`).join("");
const KIND = { have: "have", add: "add", build: "build", write: "write" };

export function token() {
  const b = new Uint8Array(18); crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]);
}

export function briefToText(brief, input) {
  const lines = [
    `KERNEL OPPORTUNITY SCAN: ${brief.business}`,
    input ? `From: ${input.name || "(no name)"} <${input.email || "no email"}>  Website: ${input.website || "none"}` : "",
    "", brief.summary || "", brief.notes ? `Notes: ${brief.notes}` : "", "",
  ];
  brief.opportunities.forEach((o, i) => {
    lines.push(`${i + 1}. ${o.title}${o.top ? "  [good place to start]" : ""}`);
    lines.push(`   ${o.category}  |  Value ${o.value[0]}/3  Complexity ${o.complexity[0]}/3`);
    o.prompted.forEach((p) => lines.push(`   [${p[0]}] ${p[1]}`));
    lines.push(`   Why: ${o.why}`, `   Build: ${o.build}`, `   First experiment: ${o.experiment}`);
    if (o.tools.length) lines.push(`   Tools: ${o.tools.map((t) => `${t[0]} (${t[1]})`).join(", ")}`);
    if (o.needs.length) lines.push(`   Needs first: ${o.needs.join("; ")}`);
    if (o.obstacles.length) lines.push(`   Obstacles: ${o.obstacles.join("; ")}`);
    if (o.validate.length) lines.push(`   Validate: ${o.validate.join("; ")}`);
    if (o.sources.length) lines.push(`   Sources: ${o.sources.join(" ")}`);
    lines.push("");
  });
  const insp = brief.inspiration || {};
  if ((insp.profiles || []).length) {
    lines.push("INSPIRATION");
    (insp.themes || []).forEach((t) => lines.push(`- ${t.theme}: ${t.detail}`));
    insp.profiles.forEach((p) => lines.push(`* ${p.name}: moat: ${p.moat} | borrow: ${p.borrow} | stand apart: ${p.stand_apart}`));
    lines.push("");
  }
  if ((brief.foundations || []).length) lines.push("FOUNDATIONS", ...brief.foundations.map((f) => `- ${f.item}${f.for ? ` (for ${f.for})` : ""}`), "");
  if ((brief.pitfalls || []).length) lines.push("PITFALLS", ...brief.pitfalls.map((p) => `- ${p}`), "");
  return lines.join("\n");
}

/** A compact, Kernel-branded HTML email of the brief. Table layout and inline styles for email clients. */
export function briefEmailHtml(env, brief, { eyebrow, heading, intro, ctaHref, ctaLabel, secondary }) {
  const G = "#2F3F36", BR = "#D2AA5A", BI = "#7A5C24", INK = "#23302A", INK2 = "#4A564E", IV = "#FBF8EF";
  const mono = "font-family:'DM Mono',Menlo,Consolas,monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;";
  const top = brief.opportunities.filter((o) => o.top);
  const rest = brief.opportunities.filter((o) => !o.top);
  const tools = (o) => o.tools.map((t) => `<span style="display:inline-block;font-size:11px;padding:2px 7px;margin:0 4px 4px 0;border:1px solid #D9D4C4;border-radius:10px;background:#fff;color:${INK}">${esc(t[0])} <span style="${mono}font-size:8px;color:${BI}">${KIND[t[1]] || ""}</span></span>`).join("");
  const row = (o) => `<tr><td style="padding:10px 0;border-bottom:1px solid #E4DFD0">
      <div style="${mono}font-size:9px;color:${BI}">${esc(o.category)}</div>
      <div style="font-family:Georgia,serif;font-size:16px;color:${INK};margin:3px 0 4px">${esc(o.title)}</div>
      <div style="font-size:13px;color:${INK2};line-height:1.5">${esc(o.why)}</div>
      <div style="margin:6px 0;font-size:11px;color:${INK2}">${dots(o.value[0], BR)} value &nbsp;&nbsp; ${dots(o.complexity[0], G)} complexity</div>
      ${o.tools.length ? `<div>${tools(o)}</div>` : ""}
      ${o.experiment ? `<div style="font-size:12.5px;color:${INK};margin-top:4px"><b>First experiment:</b> ${esc(o.experiment)}</div>` : ""}
    </td></tr>`;
  const list = (title, items) => items.length ? `<tr><td style="padding:14px 0 4px"><div style="${mono}color:${BI}">${title}</div><ul style="margin:6px 0 0;padding-left:18px;font-size:13px;color:${INK2};line-height:1.55">${items.map((x) => `<li>${x}</li>`).join("")}</ul></td></tr>` : "";
  const insp = brief.inspiration || {};
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#E9E4D6;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E9E4D6;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${IV};border-radius:10px;overflow:hidden">
  <tr><td style="background:${G};padding:22px 26px">
    <img src="${SITE(env)}/assets/kernel-lab-wordmark.png" width="132" alt="Kernel Lab" style="display:block;margin-bottom:14px">
    <div style="${mono}color:#D9B872">${esc(eyebrow)}</div>
    <div style="font-family:Georgia,serif;font-size:24px;color:#fff;margin:6px 0 6px">${esc(heading)}</div>
    <div style="font-size:14px;color:#E6E1D1;line-height:1.55">${intro}</div>
  </td></tr>
  <tr><td style="padding:6px 26px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:14px 0 0"><div style="${mono}color:${BI}">A good place to start</div></td></tr>
    ${top.map(row).join("")}
    ${rest.length ? `<tr><td style="padding:14px 0 0"><div style="${mono}color:${BI}">More possibilities</div></td></tr>${rest.map((o) => `<tr><td style="padding:7px 0;border-bottom:1px solid #E4DFD0;font-size:13.5px;color:${INK}">${esc(o.title)} <span style="font-size:11px;color:${INK2}">&nbsp;${dots(o.value[0], BR)} ${dots(o.complexity[0], G)}</span></td></tr>`).join("")}` : ""}
    ${list("Inspiration from businesses you admire", (insp.themes || []).map((t) => `<b style="color:${INK}">${esc(t.theme)}.</b> ${esc(t.detail)}`))}
    ${list("Foundations to put in place", (brief.foundations || []).map((f) => esc(f.item) + (f.for ? ` <span style="color:${BI}">· ${esc(f.for)}</span>` : "")))}
    ${list("Watch for", (brief.pitfalls || []).map(esc))}
  </table></td></tr>
  <tr><td style="padding:18px 26px 22px" align="left">
    <a href="${esc(ctaHref)}" style="display:inline-block;background:${BR};color:${G};text-decoration:none;border-radius:30px;padding:12px 22px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold">${esc(ctaLabel)}</a>
    ${secondary ? `<div style="font-size:12px;color:${INK2};margin-top:12px">${secondary}</div>` : ""}
  </td></tr>
  <tr><td style="background:#F4EFE2;padding:12px 26px;font-size:11px;color:${INK2};line-height:1.5">A first draft to validate, drawn only from your answers, your public website, and public pages of other businesses. Tools are examples to confirm, not endorsements. kernel-collective.com</td></tr>
</table></td></tr></table></body></html>`;
}

export async function storeBrief(env, id, record) {
  if (!env.SCAN_KV) return false;
  await env.SCAN_KV.put(`brief:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 60 });
  return true;
}
export async function loadBrief(env, id) {
  if (!env.SCAN_KV || !/^[a-f0-9-]{36}$/.test(id || "")) return null;
  const v = await env.SCAN_KV.get(`brief:${id}`);
  return v ? JSON.parse(v) : null;
}

async function send(env, msg, fetchImpl) {
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) return false;
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.FROM_EMAIL, ...msg }),
  });
  return res.ok;
}

/** Email Kernel: the branded brief plus an approve link. */
export async function notifyKernel(env, { id, brief, input, problems, approveToken }, fetchImpl = fetch) {
  if (!env.NOTIFY_EMAIL) return false;
  const approve = `${SITE(env)}/api/brief-approve?id=${id}&t=${approveToken || ""}`;
  const preview = `${SITE(env)}/brief.html?id=${id}&t=${approveToken || ""}`;
  const who = `${esc(input.name || "No name")} &lt;${esc(input.email || "no email")}&gt;${input.website ? ` · ${esc(input.website)}` : ""}`;
  const text = briefToText(brief, input) + (problems && problems.length ? `\nAutomatic fixes: ${problems.join(" ")}\n` : "") + `\nPreview: ${preview}\nApprove and send: ${approve}\nScan id: ${id}\n`;
  const html = briefEmailHtml(env, brief, {
    eyebrow: "Opportunity Scan to review", heading: brief.business,
    intro: `${who}<br>${esc(brief.summary)}${brief.notes ? `<br><i>${esc(brief.notes)}</i>` : ""}`,
    ctaHref: approve, ctaLabel: "Review and send",
    secondary: `<a href="${esc(preview)}" style="color:#3E5045">Preview the full brief</a>${problems && problems.length ? ` · Automatic fixes: ${esc(problems.join(" "))}` : ""}`,
  });
  return send(env, { to: [env.NOTIFY_EMAIL], reply_to: input.email || undefined, subject: `Opportunity Scan to review: ${brief.business}`, text, html }, fetchImpl);
}

/** After approval: email the founder a private link to their brief. */
export async function sendToFounder(env, { id, record }, fetchImpl = fetch) {
  const { brief, input, viewToken } = record;
  if (!input.email) return false;
  const link = `${SITE(env)}/brief.html?id=${id}&t=${viewToken}`;
  const first = (input.name || "").split(" ")[0];
  const html = briefEmailHtml(env, brief, {
    eyebrow: "Your Opportunity Scan", heading: brief.business,
    intro: `${first ? esc(first) + ", h" : "H"}ere&rsquo;s your brief from the Kernel Opportunity Scan. It&rsquo;s a first draft to check against what you know, not a verdict.`,
    ctaHref: link, ctaLabel: "Open your full brief",
    secondary: `Reply to this email to book your free follow&#8209;up call. We&rsquo;ll pick one idea and talk it through.`,
  });
  const text = `Here's your brief from the Kernel Opportunity Scan.\n\nOpen it here: ${link}\n\n` + briefToText(brief) + `\nReply to this email to book your free follow-up call.\n`;
  return send(env, { to: [input.email], reply_to: env.NOTIFY_EMAIL || undefined, subject: `Your Opportunity Scan: ${brief.business}`, text, html }, fetchImpl);
}
