// Sends one sample brief email through Resend, using the same code the live
// scan uses. Reads RESEND_API_KEY, NOTIFY_EMAIL, and FROM_EMAIL from .dev.vars
// (or the environment). Run with: npm run test-email
import { readFileSync, existsSync } from "node:fs";
import { notifyKernel } from "../lib/notify.js";

const env = { ...process.env };
if (existsSync(".dev.vars")) {
  for (const line of readFileSync(".dev.vars", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}
for (const k of ["RESEND_API_KEY", "NOTIFY_EMAIL", "FROM_EMAIL"]) {
  if (!env[k] || env[k].endsWith("...")) { console.error(`Missing ${k}. Add it to .dev.vars first.`); process.exit(1); }
}

const brief = {
  business: "Test Studio (test email)",
  summary: "This is a test of the Opportunity Scan email. No scan was run.",
  notes: "",
  opportunities: [{
    id: "test", top: true, category: "Programs & Workflows",
    title: "Turn scattered inquiries into one intake and follow-up path",
    why: "Example only.", prompted: [["told", "Example answer from the founder."]],
    build: "A single inquiry form.", experiment: "Two weeks, one form.",
    effort: ["Low", "Example."], value: ["High", "Example."], sources: [], validate: ["Example"],
  }],
};
const realFetch = globalThis.fetch;
let detail = "";
const fetchImpl = async (url, init) => { const r = await realFetch(url, init); if (!r.ok) detail = await r.clone().text(); return r; };
const ok = await notifyKernel(env, { id: "test-" + Date.now(), brief, input: { name: "Test Visitor", email: env.NOTIFY_EMAIL, website: "https://example.com" }, problems: [] }, fetchImpl);
if (ok) console.log(`Sent. Check ${env.NOTIFY_EMAIL} (and its spam folder).`);
else { console.error("Resend refused the email:", detail || "no details"); process.exit(1); }
