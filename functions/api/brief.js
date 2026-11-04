// GET /api/brief?id=&t=  Returns a stored brief for the private brief page.
// The founder's link uses the view token (works once Kernel has sent it);
// Kernel's preview link uses the approve token.
import { loadBrief } from "../../scan/lib/notify.js";
import { json } from "../../scan/lib/jobs.js";

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const rec = await loadBrief(env, u.searchParams.get("id"));
  const t = u.searchParams.get("t") || "";
  if (!rec || !t) return json({ status: "error", message: "We couldn't find that brief. The link may have expired." }, 404);
  const asKernel = t === rec.approveToken, asFounder = t === rec.viewToken && rec.status === "sent";
  if (!asKernel && !asFounder) return json({ status: "error", message: "We couldn't find that brief. The link may have expired." }, 404);
  return json({ status: "ok", preview: asKernel && rec.status !== "sent", brief: rec.brief, input: { website: rec.input.website, room: rec.input.room, room_other: rec.input.room_other, stuck: rec.input.stuck, admire: rec.input.admire }, createdAt: rec.createdAt });
}
