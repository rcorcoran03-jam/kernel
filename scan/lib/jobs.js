// Scan jobs: the scan runs one stage per request so no single request is long.
// Job state lives in KV between requests.
import { STAGES, runStage, finishScan } from "./pipeline.js";
import { storeBrief, notifyKernel, token } from "./notify.js";
import { ScanError } from "./claude.js";

const KEY = (id) => `job:${id}`;
const TTL = 60 * 60 * 6;
const LOCK_MS = 170 * 1000;

export const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export async function createJob(env, input) {
  const id = crypto.randomUUID();
  const job = { id, secret: token(), input, next: STAGES[0], state: {}, createdAt: new Date().toISOString(), t0: Date.now() };
  await env.SCAN_KV.put(KEY(id), JSON.stringify(job), { expirationTtl: TTL });
  return job;
}

export async function loadJob(env, id, secret) {
  if (!/^[a-f0-9-]{36}$/.test(id || "")) return null;
  const v = await env.SCAN_KV.get(KEY(id));
  if (!v) return null;
  const job = JSON.parse(v);
  return job.secret === secret ? job : null;
}

const save = (env, job) => env.SCAN_KV.put(KEY(job.id), JSON.stringify(job), { expirationTtl: TTL });

/** Run the next stage of a job, or finish it. Returns a response body. */
export async function stepJob(env, job, opts = {}) {
  if (job.result) return job.result;
  if (job.lockedAt && Date.now() - job.lockedAt < LOCK_MS) return { status: "running", next: job.next, done: STAGES.slice(0, STAGES.indexOf(job.next)) };
  job.lockedAt = Date.now(); await save(env, job);
  try {
    await runStage(job.next, job.input, job.state, env, opts);
    const i = STAGES.indexOf(job.next);
    if (i < STAGES.length - 1) {
      job.next = STAGES[i + 1]; job.lockedAt = 0; await save(env, job);
      return { status: "running", next: job.next, done: STAGES.slice(0, i + 1) };
    }
    job.result = await finishJob(env, job, opts);
    job.lockedAt = 0; await save(env, job);
    return job.result;
  } catch (err) {
    job.lockedAt = 0; job.failures = (job.failures || 0) + 1; await save(env, job);
    throw err;
  }
}

async function finishJob(env, job, opts) {
  let brief, problems;
  try { ({ brief, problems } = finishScan(job.input, job.state)); }
  catch (err) { if (err instanceof ScanError && err.kind === "empty") return { status: "empty", message: err.message }; throw err; }
  const humanReview = env.HUMAN_REVIEW !== "false";
  const record = {
    createdAt: job.createdAt, input: job.input, brief,
    meta: { seconds: Math.round((Date.now() - job.t0) / 1000), usage: job.state.usage, problems, evidence: { site: job.state.site, peers: job.state.peers }, draft: job.state.draft },
    status: humanReview ? "pending" : "sent", approveToken: token(), viewToken: token(),
  };
  await storeBrief(env, job.id, record);
  if (humanReview) {
    await notifyKernel(env, { id: job.id, brief, input: job.input, problems, approveToken: record.approveToken }, opts.fetchImpl || fetch).catch(() => false);
    return { status: "queued", id: job.id, message: "Your scan is done. It's with Kernel for a quick human review, and we'll email your brief within one business day." };
  }
  return { status: "ready", id: job.id, brief };
}

export function errorBody(err) {
  const known = err instanceof ScanError;
  console.error("scan failed", known ? err.kind : "unknown", err.message, known && err.detail ? err.detail : "");
  if (known && ["guard", "limit", "empty"].includes(err.kind)) return [{ status: err.kind === "empty" ? "empty" : "error", message: err.message }, err.kind === "empty" ? 200 : 429];
  return [{ status: "error", retry: true, message: "Something went wrong running the scan. Your answers are still saved below, so you can send them with an inquiry." }, 500];
}
