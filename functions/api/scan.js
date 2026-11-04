// POST /api/scan  (Cloudflare Pages Function)
// Starts the Kernel Opportunity Scan. With KV bound, it only checks the form and
// creates a job; the browser then calls /api/scan-step once per stage, so no
// single request runs long. Secrets live in Cloudflare, never in the browser.
import { cleanInput } from "../../scan/lib/validate.js";
import { runScan, STAGES } from "../../scan/lib/pipeline.js";
import { verifyTurnstile, checkLimits } from "../../scan/lib/guard.js";
import { storeBrief, notifyKernel, token } from "../../scan/lib/notify.js";
import { createJob, json, errorBody } from "../../scan/lib/jobs.js";

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
    if (env.SCAN_KV) {
      const job = await createJob(env, input);
      return json({ status: "started", id: job.id, key: job.secret, next: job.next, stages: STAGES });
    }
    // Local fallback without KV: run everything in one request.
    const { brief, meta } = await runScan(input, env);
    const id = crypto.randomUUID();
    if (humanReview) {
      const approveToken = token();
      await storeBrief(env, id, { createdAt: new Date().toISOString(), input, brief, meta, status: "pending", approveToken, viewToken: token() });
      await notifyKernel(env, { id, brief, input, problems: meta.problems, approveToken });
      return json({ status: "queued", id, message: "Your brief is with Kernel for a quick human review. We'll email it to you within one business day." });
    }
    return json({ status: "ready", id, brief });
  } catch (err) {
    const [body, status] = errorBody(err);
    return json(body, status);
  }
}

export function onRequest() {
  return json({ status: "error", message: "Use POST." }, 405);
}
