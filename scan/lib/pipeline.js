// The four-stage Opportunity Scan pipeline.
// Each stage can run on its own (runStage), so the live endpoint can do one
// stage per request and keep every request short. runScan runs them all.
import { callClaude, parseJson, TOOLS, ScanError } from "./claude.js";

const REPAIR_SYSTEM = "You fix broken JSON. You will receive text that was meant to be a single JSON object but has a syntax error or extra text around it. Return only the corrected JSON object, keeping every field and value exactly as written. Do not add, remove, or reword content. No other text.";
import { founderAnswers, normalizeBrief } from "./validate.js";
import { SITE_OBSERVATIONS_SYSTEM, siteObservationsUser } from "../prompts/site-observations.js";
import { COMPETITIVE_SCAN_SYSTEM, competitiveScanUser } from "../prompts/competitive-scan.js";
import { OPPORTUNITY_SYNTHESIS_SYSTEM, opportunitySynthesisUser } from "../prompts/opportunity-synthesis.js";
import { REVIEW_PASS_SYSTEM, reviewPassUser } from "../prompts/review-pass.js";

const DEFAULT_MODEL = "claude-sonnet-5-5";
export const STAGES = ["site", "peers", "synthesis", "review"];

const models = (env) => ({
  research: env.SCAN_RESEARCH_MODEL || env.SCAN_MODEL || DEFAULT_MODEL,
  writer: env.SCAN_WRITER_MODEL || env.SCAN_MODEL || DEFAULT_MODEL,
});

/** Run one stage. `state` carries results between stages and is safe to store as JSON. */
export async function runStage(stage, input, state, env, { fetchImpl = fetch, log = () => {} } = {}) {
  const m = models(env);
  const answers = founderAnswers(input);
  state.usage = state.usage || [];
  log("stage", stage);

  if (stage === "site") {
    state.site = { business_name: null, summary: input.describe || "", pages: [], observations: [], tools_seen: [], gaps: [], limits: ["No website was provided."] };
    if (input.website) {
      const r = await callClaude({
        env, model: m.research, fetchImpl, maxTokens: 4000,
        system: SITE_OBSERVATIONS_SYSTEM,
        user: siteObservationsUser({ website: input.website }),
        tools: [TOOLS.fetch({ max_uses: 6, allowed_domains: [input.domain, "www." + input.domain], max_content_tokens: 20000 })],
      });
      state.usage.push(["site", r.usage]);
      state.site = withList(withList(await readJson(r, "site", env, m.research, fetchImpl, state), "observations"), "tools_seen");
    }
    return state;
  }

  if (stage === "peers") {
    state.peers = { peers: [], themes: [], not_found: [], limits: [] };
    if (input.admire || input.allowDiscovery) {
      const r = await callClaude({
        env, model: m.research, fetchImpl, maxTokens: 6000,
        system: COMPETITIVE_SCAN_SYSTEM,
        user: competitiveScanUser({ admire: input.admire, summary: (state.site && state.site.summary) || input.describe, location: input.location, allowDiscovery: input.allowDiscovery }),
        tools: [
          TOOLS.search({ max_uses: 5, ...(input.domain ? { blocked_domains: [input.domain] } : {}) }),
          TOOLS.fetch({ max_uses: 6, max_content_tokens: 15000 }),
        ],
      });
      state.usage.push(["peers", r.usage]);
      state.peers = withList(await readJson(r, "peers", env, m.research, fetchImpl, state), "peers");
    }
    return state;
  }

  if (stage === "synthesis") {
    const s = await callClaude({
      env, model: m.writer, fetchImpl, maxTokens: 16000,
      system: OPPORTUNITY_SYNTHESIS_SYSTEM,
      user: opportunitySynthesisUser({ answers, site: state.site, peers: state.peers }),
    });
    state.usage.push(["synthesis", s.usage]);
    state.draft = await readJson(s, "synthesis", env, m.writer, fetchImpl, state);
    return state;
  }

  if (stage === "review") {
    const v = await callClaude({
      env, model: m.writer, fetchImpl, maxTokens: 16000,
      system: REVIEW_PASS_SYSTEM,
      user: reviewPassUser({ draft: state.draft, answers, site: state.site, peers: state.peers }),
    });
    state.usage.push(["review", v.usage]);
    state.reviewed = await readJson(v, "review", env, m.writer, fetchImpl, state);
    return state;
  }

  throw new ScanError("config", "Unknown stage " + stage);
}

/** Turn the finished state into the brief the page renders. */
export function finishScan(input, state) {
  const site = state.site || {}, peers = state.peers || {};
  const evidenceUrls = [
    ...(site.observations || []).map((o) => o.url),
    ...(site.pages || []).map((p) => p.url),
    ...(peers.peers || []).flatMap((p) => [p.url, ...(p.practices || []).map((x) => x.url)]),
  ].filter(Boolean);
  const haveTools = [
    ...(site.tools_seen || []).map((t) => t && t.name).filter(Boolean),
    ...String(input.tools || "").split(/[,;\n]|\band\b/).map((t) => t.trim()).filter((t) => t.length > 1),
  ];
  const peerNames = (peers.peers || []).map((p) => p.name).filter(Boolean);
  const { brief, problems } = normalizeBrief(state.reviewed || state.draft || {}, evidenceUrls, { haveTools, peerNames });
  if (!brief.opportunities.length) throw new ScanError("empty", "The scan didn't find opportunities it could support with evidence.");
  return { brief, problems };
}

export async function runScan(input, env, opts = {}) {
  const state = {};
  const t0 = Date.now();
  for (const stage of STAGES) await runStage(stage, input, state, env, opts);
  const { brief, problems } = finishScan(input, state);
  return { brief, meta: { seconds: Math.round((Date.now() - t0) / 1000), usage: state.usage, problems, evidence: { site: state.site, peers: state.peers }, draft: state.draft } };
}

/** Parse a stage's reply. If the reply was cut off, say so; if it is only malformed, ask once for a repair. */
async function readJson(r, label, env, model, fetchImpl, state) {
  if (r.stopReason === "max_tokens") throw new ScanError("format", `The ${label} step ran out of room before finishing.`, `stop max_tokens; length ${r.text.length}`);
  try { return parseJson(r.text); }
  catch (err) {
    if (!(err instanceof ScanError) || err.kind !== "format") throw err;
    console.warn("repairing JSON", label, err.detail || "");
    const fix = await callClaude({ env, model, fetchImpl, maxTokens: 16000, system: REPAIR_SYSTEM, user: r.text.slice(0, 120000) });
    state.usage.push([label + "-repair", fix.usage]);
    return parseJson(fix.text);
  }
}

function withList(obj, key) { if (!Array.isArray(obj[key])) obj[key] = []; return obj; }
