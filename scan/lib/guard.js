// Abuse and cost protection. A scan makes several paid AI calls, so the
// endpoint refuses to run without at least one guard unless explicitly allowed.
import { ScanError } from "./claude.js";

export async function verifyTurnstile(env, token, ip, fetchImpl = fetch) {
  if (!env.TURNSTILE_SECRET) return { skipped: true };
  if (!token) throw new ScanError("guard", "Please complete the verification check.");
  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!data.success) throw new ScanError("guard", "Verification failed. Please refresh and try again.");
  return { ok: true };
}

export async function checkLimits(env, ip) {
  const kv = env.SCAN_KV;
  if (!kv) {
    if (!env.TURNSTILE_SECRET && env.ALLOW_UNGUARDED !== "true") {
      throw new ScanError("config", "The scan is not protected yet. Add Turnstile or a SCAN_KV binding before going live.");
    }
    return { skipped: true };
  }
  const day = new Date().toISOString().slice(0, 10);
  const perIp = parseInt(env.MAX_SCANS_PER_IP_PER_DAY || "3", 10);
  const perDay = parseInt(env.MAX_SCANS_PER_DAY || "25", 10);
  const ipKey = `rl:${day}:${ip || "unknown"}`, dayKey = `rl:${day}:all`;
  const [ipCount, dayCount] = await Promise.all([kv.get(ipKey), kv.get(dayKey)]).then((v) => v.map((x) => parseInt(x || "0", 10)));
  if (dayCount >= perDay) throw new ScanError("limit", "Today's scans are fully booked. Please try again tomorrow, or start a conversation instead.");
  if (ipCount >= perIp) throw new ScanError("limit", "You've reached today's scan limit. Start a conversation and we'll pick it up from there.");
  // KV is eventually consistent, so these limits are approximate. Good enough for cost control at this scale.
  await Promise.all([
    kv.put(ipKey, String(ipCount + 1), { expirationTtl: 60 * 60 * 26 }),
    kv.put(dayKey, String(dayCount + 1), { expirationTtl: 60 * 60 * 26 }),
  ]);
  return { ok: true };
}
