// Human-review mode: store the brief and email Kernel a readable copy.
// Email uses Resend (https://resend.com) when RESEND_API_KEY is set.

export function briefToText(brief, input) {
  const lines = [
    `KERNEL OPPORTUNITY SCAN: ${brief.business}`,
    input ? `From: ${input.name || "(no name)"} <${input.email || "no email"}>  Website: ${input.website || "none"}` : "",
    "",
    brief.summary || "",
    brief.notes ? `Notes: ${brief.notes}` : "",
    "",
  ];
  brief.opportunities.forEach((o, i) => {
    lines.push(`${i + 1}. ${o.title}${o.top ? "  [top three]" : ""}`);
    lines.push(`   ${o.category}`);
    o.prompted.forEach((p) => lines.push(`   [${p[0]}] ${p[1]}`));
    lines.push(`   Why: ${o.why}`, `   Build: ${o.build}`, `   First experiment: ${o.experiment}`);
    lines.push(`   Effort: ${o.effort[0]} (${o.effort[1]})  Value: ${o.value[0]} (${o.value[1]})`);
    if (o.validate.length) lines.push(`   Validate: ${o.validate.join("; ")}`);
    if (o.sources.length) lines.push(`   Sources: ${o.sources.join(" ")}`);
    lines.push("");
  });
  return lines.filter((l) => l !== null).join("\n");
}

export async function storeBrief(env, id, record) {
  if (!env.SCAN_KV) return false;
  await env.SCAN_KV.put(`brief:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 30 });
  return true;
}

export async function notifyKernel(env, { id, brief, input, problems }, fetchImpl = fetch) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_EMAIL || !env.FROM_EMAIL) return false;
  const text = briefToText(brief, input) + (problems && problems.length ? `\nAutomatic fixes: ${problems.join(" ")}\n` : "") + `\nScan id: ${id}\n`;
  const res = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [env.NOTIFY_EMAIL],
      reply_to: input.email || undefined,
      subject: `Opportunity Scan to review: ${brief.business}`,
      text,
    }),
  });
  return res.ok;
}
