// POST /api/inquiry  The site's "Start a conversation" forms. Saves a lead to
// Kernel HQ and emails hello@ a copy. Accepts form data or JSON.
import { newLead, putLead } from "../../scan/lib/hq.js";
import { json } from "../../scan/lib/jobs.js";

const FORMS = { "lab-inquiry": "Kernel Lab inquiry", "core-inquiry": "Kernel Suite inquiry", contact: "Starting a conversation" };

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("origin");
  const allowed = (env.ALLOWED_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
  if (allowed.length && origin && !allowed.includes(origin)) return json({ status: "error", message: "Not allowed." }, 403);
  let d = {};
  try {
    const ct = request.headers.get("content-type") || "";
    if (ct.includes("application/json")) d = await request.json();
    else { const f = await request.formData(); f.forEach((v, k) => { d[k] = typeof v === "string" ? v : ""; }); }
  } catch (e) { return json({ status: "error", message: "Couldn't read the form." }, 400); }
  if (d.company_site) return json({ status: "ok" }); // honeypot
  const email = String(d.email || "").trim(), name = String(d.name || "").trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ status: "error", message: "Please add your name and a valid email." }, 422);
  const form = FORMS[d.form] ? d.form : "contact";
  const known = ["form", "name", "email", "message", "business", "website", "phone"];
  const extra = Object.keys(d).filter((k) => !known.includes(k) && d[k]).map((k) => `${k}: ${d[k]}`).join("\n");
  const message = [String(d.message || ""), extra].filter(Boolean).join("\n\n");

  let saved = false;
  if (env.SCAN_KV) {
    const lead = newLead({ source: form, name, email, business: d.business, website: d.website, phone: d.phone, message });
    lead.notes.push({ at: new Date().toISOString(), kind: "system", text: `${FORMS[form]} from the website.` });
    await putLead(env, lead); saved = true;
  }
  let emailed = false;
  if (env.RESEND_API_KEY && env.FROM_EMAIL && env.NOTIFY_EMAIL) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: [env.NOTIFY_EMAIL], reply_to: email, subject: `${FORMS[form]}: ${name}`, text: `${name} <${email}>\n\n${message}\n\nIn Kernel HQ: ${(env.SITE_URL || "https://kernel-collective.com")}/hq/` }),
    }).catch(() => null);
    emailed = !!(r && r.ok);
  }
  if (!saved && !emailed) return json({ status: "error", message: "Something went wrong sending that." }, 500);
  return json({ status: "ok" });
}
export function onRequest() { return json({ status: "error", message: "Use POST." }, 405); }
