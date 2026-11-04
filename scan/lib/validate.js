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

const TOOL_KINDS = ["have", "add", "build", "write"];
const BASIS = ["seen", "inferred"];
const LEVEL_TO_N = { "Low": 1, "Low to medium": 1, "Medium": 2, "Medium to high": 3, "High": 3 };

/** A 1 to 3 rating with a reason. Accepts the older word levels too. */
function rating(pair) {
  const raw = Array.isArray(pair) ? pair[0] : pair;
  let n = typeof raw === "number" ? Math.round(raw) : (LEVEL_TO_N[raw] || parseInt(raw, 10));
  if (!(n >= 1 && n <= 3)) n = 2;
  return [n, noDash(clip(Array.isArray(pair) ? pair[1] : "", 240)) || "Reasoning not given."];
}
const strList = (v, n, len) => (Array.isArray(v) ? v : []).filter((x) => typeof x === "string" && x.trim()).map((x) => noDash(clip(x, len))).slice(0, n);
const basisList = (v, n) => (Array.isArray(v) ? v : [])
  .map((x) => (Array.isArray(x) ? x : x && typeof x === "object" ? [x.text, x.basis] : [x, "inferred"]))
  .filter((x) => typeof x[0] === "string" && x[0].trim())
  .map((x) => [noDash(clip(x[0], 90)), BASIS.includes(x[1]) ? x[1] : "inferred"]).slice(0, n);

/** Normalize and enforce the brief shape. Returns { brief, problems }. */
export function normalizeBrief(raw, evidenceUrls = [], ctx = {}) {
  const problems = [];
  const allowed = new Set(evidenceUrls);
  const haveOk = (ctx.haveTools || []).map((t) => String(t).toLowerCase());
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
    const sources = (Array.isArray(o.sources) ? o.sources : []).filter((s) => typeof s === "string" && (allowed.size === 0 ? /^https?:\/\//.test(s) : allowed.has(s)));
    if (Array.isArray(o.sources) && sources.length < o.sources.length) problems.push(`Removed unverified sources from "${o.title}".`);
    const tools = (Array.isArray(o.tools) ? o.tools : [])
      .map((t) => (Array.isArray(t) ? t : t && typeof t === "object" ? [t.name, t.kind] : null))
      .filter((t) => t && typeof t[0] === "string" && t[0].trim())
      .map((t) => {
        let kind = TOOL_KINDS.includes(t[1]) ? t[1] : "add";
        const name = noDash(clip(t[0], 50));
        if (kind === "have" && haveOk.length && !haveOk.some((h) => name.toLowerCase().includes(h) || h.includes(name.toLowerCase()))) { kind = "add"; problems.push(`"${name}" relabeled from have to add.`); }
        return [name, kind];
      }).slice(0, 4);
    opps.push({
      id, top: !!o.top, category,
      title: noDash(clip(o.title, 120)),
      why: noDash(clip(o.why, 400)),
      prompted,
      build: noDash(clip(o.build, 400)),
      experiment: noDash(clip(o.experiment, 300)),
      value: rating(o.value),
      complexity: rating(o.complexity || o.effort),
      tools,
      needs: strList(o.needs, 3, 120),
      obstacles: strList(o.obstacles, 3, 140),
      sources: sources.slice(0, 6),
      validate: strList(o.validate, 4, 160),
    });
  }

  let tops = 0;
  opps.forEach((o) => { if (o.top) { tops++; if (tops > 3) { o.top = false; problems.push("Limited top picks to three."); } } });
  if (tops === 0 && opps.length) opps.slice(0, Math.min(3, opps.length)).forEach((o) => (o.top = true));

  const ids = new Set(opps.map((o) => o.id));
  const insp = (raw && raw.inspiration) || {};
  const peerNames = (ctx.peerNames || []).map((n) => String(n).toLowerCase());
  const profiles = (Array.isArray(insp.profiles) ? insp.profiles : [])
    .filter((p) => p && typeof p.name === "string" && p.name.trim())
    .filter((p) => { const ok = !peerNames.length || peerNames.includes(p.name.trim().toLowerCase()); if (!ok) problems.push(`Dropped profile "${p.name}": not in the research.`); return ok; })
    .slice(0, 3)
    .map((p) => ({
      name: noDash(clip(p.name, 80)),
      url: typeof p.url === "string" && /^https?:\/\//.test(p.url) ? p.url : "",
      origin: p.origin === "found_by_search" ? "found_by_search" : "named_by_founder",
      moat: noDash(clip(p.moat, 220)),
      offers: basisList(p.offers, 3), programs: basisList(p.programs, 3), strategy: basisList(p.strategy, 3),
      sales_tools: basisList(p.sales_tools, 3), tech_stack: basisList(p.tech_stack, 4),
      borrow: noDash(clip(p.borrow, 220)), stand_apart: noDash(clip(p.stand_apart, 220)),
    }));
  const themes = (Array.isArray(insp.themes) ? insp.themes : [])
    .filter((t) => t && typeof t.theme === "string" && t.theme.trim()).slice(0, 5)
    .map((t) => ({ theme: noDash(clip(t.theme, 70)), detail: noDash(clip(t.detail, 220)), peers: strList(t.peers, 3, 80), opportunity: ids.has(t.opportunity) ? t.opportunity : null }));
  const foundations = (Array.isArray(raw && raw.foundations) ? raw.foundations : [])
    .map((f) => (typeof f === "string" ? { item: f, for: "" } : f))
    .filter((f) => f && typeof f.item === "string" && f.item.trim()).slice(0, 6)
    .map((f) => ({ item: noDash(clip(f.item, 120)), for: noDash(clip(f.for, 80)) }));

  return {
    brief: {
      version: 2,
      sample: false,
      business: noDash(clip(raw && raw.business, 120)) || "Your business",
      summary: noDash(clip(raw && raw.summary, 500)),
      notes: noDash(clip(raw && raw.notes, 1200)),
      opportunities: opps,
      foundations,
      pitfalls: strList(raw && raw.pitfalls, 5, 220),
      inspiration: { themes, profiles },
    },
    problems,
  };
}
