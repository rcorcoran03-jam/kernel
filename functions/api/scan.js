// POST /api/scan  (Cloudflare Pages Function)
// Runs the Kernel Opportunity Scan on the server. Secrets live in Cloudflare
// environment variables, never in the browser.
import { cleanInput } from "../../scan/lib/validate.js";
import { runScan } from "../../scan/lib/pipeline.js";
import { verifyTurnstile, checkLimits } from "../../scan/lib/guard.js";
import { storeBrief, notifyKernel } from "../../scan/lib/notify.js";
import { ScanError } from "../../scan/lib/claude.js";

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function onRequestPost({ request, env }) {
  if (env.SCAN_ENABLED !== "true") return json({ status: "off", message: "The live scan isn't switched on yet." }, 503);

  const origin = request.headers.get("origin");
  const allowed = (env.ALLOWED_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
  if (allowed.length && origin && !allowed.includes(origin)) return json({ status: "error", message: "Not allowed." }, 403);

  let raw;
  try { raw = await request.json(); } catch (e) { return json({ status: "error", message: "Couldn't read the form." }, 400); }

  const { input, errors } = cleanInput(raw || {});
  const humanReview = env.HUMAN_REVIEW !== "false";
  if (humanReview && !input.email) errors.push("Add your email so we can send your brief.");
  if (errors.length) return json({ status: "invalid", errors }, 422);

  const ip = request.headers.get("cf-connecting-ip") || "";
  try {
    await verifyTurnstile(env, raw.turnstileToken, ip);
    await checkLimits(env, ip);
    const { brief, meta } = await runScan(input, env);
    const id = crypto.randomUUID();

    if (humanReview) {
      await storeBrief(env, id, { createdAt: new Date().toISOString(), input, brief, meta });
      await notifyKernel(env, { id, brief, input, problems: meta.problems });
      return json({ status: "queued", id, message: "Your brief is with Kernel for a quick human review. We'll email it to you within one business day." });
    }
    return json({ status: "ready", id, brief });
  } catch (err) {
    const known = err instanceof ScanError;
    console.error("scan failed", known ? err.kind : "unknown", err.message, known && err.detail ? err.detail : "");
    const status = known && (err.kind === "guard" || err.kind === "limit") ? 429 : known && err.kind === "empty" ? 200 : 500;
    const message = known && ["guard", "limit", "empty"].includes(err.kind) ? err.message : "Something went wrong running the scan. Your answers are still saved below, so you can send them with an inquiry.";
    return json({ status: known && err.kind === "empty" ? "empty" : "error", message }, status);
  }
}

export function onRequest() {
  return json({ status: "error", message: "Use POST." }, 405);
}
