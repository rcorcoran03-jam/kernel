// POST /api/scan-step  { id, key }  Runs the next stage of a scan job.
import { loadJob, stepJob, json, errorBody } from "../../scan/lib/jobs.js";

export async function onRequestPost({ request, env }) {
  if (env.SCAN_ENABLED !== "true" || !env.SCAN_KV) return json({ status: "off", message: "The live scan isn't switched on yet." }, 503);
  let raw; try { raw = await request.json(); } catch (e) { return json({ status: "error", message: "Couldn't read the request." }, 400); }
  const job = await loadJob(env, raw && raw.id, raw && raw.key);
  if (!job) return json({ status: "error", message: "This scan has expired. Please start a new one." }, 404);
  if ((job.failures || 0) >= 3) return json({ status: "error", message: "The scan couldn't finish after a few tries. Your answers are saved below, so you can send them with an inquiry." }, 500);
  try { return json(await stepJob(env, job)); }
  catch (err) { const [body, status] = errorBody(err); return json(body, status); }
}
export function onRequest() { return json({ status: "error", message: "Use POST." }, 405); }
