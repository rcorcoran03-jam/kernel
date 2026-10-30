// Input cleaning and brief validation. Code-level checks run after the model's
// own review pass, so the page never renders something out of shape.

export const CATEGORIES = ["Products & Offerings", "Programs & Workflows", "Admin & Operations"];
export const LEVELS = ["Low", "Low to medium", "Medium", "Medium to high", "High"];
export const EVIDENCE = ["site", "told", "peer", "hyp"];
const ROOMS = ["Customers", "Creative work", "Growth", "Smoother operations", "Other"];

const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const noDash = (s) => (typeof s === "string" ? s.replace(/\s*—\s*/g, ", ").replace(/–/g, "-") : s);

export function cleanInput(raw) {
  const errors = [];
  const input = {
    website: clip(raw.website, 200),
    describe: clip(raw.describe, 600),
    room: ROOMS.includes(raw.room) ? raw.room : "",
    room_other: clip(raw.room_other, 200),
    stuck: clip(raw.stuck, 1200),
    admire: clip(raw.admire, 400),
    tools: clip(raw.tools, 300),
    team: clip(raw.team, 200),
    location: clip(raw.location, 120),
    name: clip(raw.name, 120),
    email: clip(raw.email, 200),
    consent: raw.consent === true || raw.consent === "on" || raw.consent === "true",
    allowDiscovery: raw.allowDiscovery !== false,
  };
  if (input.website) {
    try {
      const u = new URL(/^https?:\/\//i.test(input.website) ? input.website : "https://" + input.website);
      if (!/^https?:$/.test(u.protocol)) throw new Error();
      if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname) || !u.hostname.includes(".")) throw new Error();
      input.website = u.origin + (u.pathname === "/" ? "" : u.pathname);
      input.domain = u.hostname.replace(/^www\./, "");
    } catch (e) {
      errors.push("Please enter a full website address, like https://yourbusiness.com.");
    }
  }
  if (!input.website && !input.describe) errors.push("Add your website, or describe your business if you don't have one yet.");
  if (!input.stuck) errors.push("Tell us what repeatedly takes too much time or falls through the cracks.");
  if (!input.consent) errors.push("Please confirm Kernel may read your public website and research the businesses you named.");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.push("Please check your email address.");
  return { input, errors };
}

/** What the founder told us, in the shape the prompts expect. */
export function founderAnswers(input) {
  return {
    more_room_for: input.room === "Other" ? input.room_other || "Something else" : input.room || "not given",
    keeps_slipping: input.stuck,
    business_description: input.describe || undefined,
    admired_or_competitors: input.admire || undefined,
    tools_in_use: input.tools || undefined,
    who_does_the_work: input.team || undefined,
    location: input.location || undefined,
  };
}

/** Normalize and enforce the brief shape. Returns { brief, problems }. */
export function normalizeBrief(raw, evidenceUrls = []) {
  const problems = [];
  const allowed = new Set(evidenceUrls);
  const seen = new Set();
  const list = Array.isArray(raw && raw.opportunities) ? raw.opportunities : [];
  const opps = [];

  for (const o of list) {
    if (opps.length >= 10) { problems.push("Trimmed to 10 opportunities."); break; }
    if (!o || typeof o.title !== "string" || !o.title.trim()) { problems.push("Dropped an opportunity with no title."); continue; }
    const category = CATEGORIES.includes(o.category) ? o.category : null;
    if (!category) { problems.push(`Dropped "${o.title}": unknown category.`); continue; }
    const prompted = (Array.isArray(o.prompted) ? o.prompted : [])
      .filter((p) => Array.isArray(p) && EVIDENCE.includes(p[0]) && typeof p[1] === "string" && p[1].trim())
      .map((p) => [p[0], noDash(clip(p[1], 400))]);
    if (!prompted.length) { problems.push(`Dropped "${o.title}": nothing prompted it.`); continue; }
    let id = String(o.id || o.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "opp";
    while (seen.has(id)) id += "-2";
    seen.add(id);
    const level = (pair) => {
      const lv = Array.isArray(pair) && LEVELS.includes(pair[0]) ? pair[0] : "Medium";
      return [lv, noDash(clip(Array.isArray(pair) ? pair[1] : "", 300)) || "Reasoning not given."];
    };
    const sources = (Array.isArray(o.sources) ? o.sources : []).filter((s) => typeof s === "string" && (allowed.size === 0 ? /^https?:\/\//.test(s) : allowed.has(s)));
    if (Array.isArray(o.sources) && sources.length < o.sources.length) problems.push(`Removed unverified sources from "${o.title}".`);
    opps.push({
      id, top: !!o.top, category,
      title: noDash(clip(o.title, 160)),
      why: noDash(clip(o.why, 500)),
      prompted,
      build: noDash(clip(o.build, 500)),
      experiment: noDash(clip(o.experiment, 400)),
      effort: level(o.effort),
      value: level(o.value),
      sources: sources.slice(0, 6),
      validate: (Array.isArray(o.validate) ? o.validate : []).filter((v) => typeof v === "string" && v.trim()).map((v) => noDash(clip(v, 200))).slice(0, 5),
    });
  }

  let tops = 0;
  opps.forEach((o) => { if (o.top) { tops++; if (tops > 3) { o.top = false; problems.push("Limited top picks to three."); } } });
  if (tops === 0 && opps.length) opps.slice(0, Math.min(3, opps.length)).forEach((o) => (o.top = true));

  return {
    brief: {
      sample: false,
      business: noDash(clip(raw && raw.business, 120)) || "Your business",
      summary: noDash(clip(raw && raw.summary, 600)),
      notes: noDash(clip(raw && raw.notes, 1200)),
      opportunities: opps,
    },
    problems,
  };
}
