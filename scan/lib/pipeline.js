// The four-stage Opportunity Scan pipeline.
import { callClaude, parseJson, TOOLS, ScanError } from "./claude.js";
import { founderAnswers, normalizeBrief } from "./validate.js";
import { SITE_OBSERVATIONS_SYSTEM, siteObservationsUser } from "../prompts/site-observations.js";
import { COMPETITIVE_SCAN_SYSTEM, competitiveScanUser } from "../prompts/competitive-scan.js";
import { OPPORTUNITY_SYNTHESIS_SYSTEM, opportunitySynthesisUser } from "../prompts/opportunity-synthesis.js";
import { REVIEW_PASS_SYSTEM, reviewPassUser } from "../prompts/review-pass.js";

const DEFAULT_MODEL = "claude-sonnet-5-5";

export async function runScan(input, env, { fetchImpl = fetch, log = () => {} } = {}) {
  const research = env.SCAN_RESEARCH_MODEL || env.SCAN_MODEL || DEFAULT_MODEL;
  const writer = env.SCAN_WRITER_MODEL || env.SCAN_MODEL || DEFAULT_MODEL;
  const answers = founderAnswers(input);
  const usage = [];
  const t0 = Date.now();

  // Stage 1: site observations (only the visitor's own domain may be fetched)
  let site = { business_name: null, summary: input.describe || "", pages: [], observations: [], gaps: [], limits: ["No website was provided."] };
  if (input.website) {
    log("stage", "site");
    const r = await callClaude({
      env, model: research, fetchImpl, maxTokens: 4000,
      system: SITE_OBSERVATIONS_SYSTEM,
      user: siteObservationsUser({ website: input.website }),
      tools: [TOOLS.fetch({ max_uses: 6, allowed_domains: [input.domain, "www." + input.domain], max_content_tokens: 20000 })],
    });
    usage.push(["site", r.usage]);
    site = withList(parseJson(r.text), "observations");
    site._urls = r.urls;
  }

  // Stage 2: competitive scan
  let peers = { peers: [], not_found: [], limits: [] };
  if (input.admire || input.allowDiscovery) {
    log("stage", "peers");
    const r = await callClaude({
      env, model: research, fetchImpl, maxTokens: 4000,
      system: COMPETITIVE_SCAN_SYSTEM,
      user: competitiveScanUser({ admire: input.admire, summary: site.summary || input.describe, location: input.location, allowDiscovery: input.allowDiscovery }),
      tools: [
        TOOLS.search({ max_uses: 5, ...(input.domain ? { blocked_domains: [input.domain] } : {}) }),
        TOOLS.fetch({ max_uses: 6, max_content_tokens: 15000 }),
      ],
    });
    usage.push(["peers", r.usage]);
    peers = withList(parseJson(r.text), "peers");
    peers._urls = r.urls;
  }

  const evidenceUrls = [
    ...(site.observations || []).map((o) => o.url),
    ...(site.pages || []).map((p) => p.url),
    ...(peers.peers || []).flatMap((p) => [p.url, ...(p.practices || []).map((x) => x.url)]),
  ].filter(Boolean);
  const siteForModel = strip(site), peersForModel = strip(peers);

  // Stage 3: synthesis (no tools)
  log("stage", "synthesis");
  const s = await callClaude({
    env, model: writer, fetchImpl, maxTokens: 8000,
    system: OPPORTUNITY_SYNTHESIS_SYSTEM,
    user: opportunitySynthesisUser({ answers, site: siteForModel, peers: peersForModel }),
  });
  usage.push(["synthesis", s.usage]);
  const draft = parseJson(s.text);

  // Stage 4: review pass (no tools)
  log("stage", "review");
  const v = await callClaude({
    env, model: writer, fetchImpl, maxTokens: 8000,
    system: REVIEW_PASS_SYSTEM,
    user: reviewPassUser({ draft, answers, site: siteForModel, peers: peersForModel }),
  });
  usage.push(["review", v.usage]);
  const reviewed = parseJson(v.text);

  const { brief, problems } = normalizeBrief(reviewed, evidenceUrls);
  if (!brief.opportunities.length) throw new ScanError("empty", "The scan didn't find opportunities it could support with evidence.");

  return {
    brief,
    meta: { seconds: Math.round((Date.now() - t0) / 1000), usage, problems, evidence: { site: siteForModel, peers: peersForModel }, draft },
  };
}

function withList(obj, key) { if (!Array.isArray(obj[key])) obj[key] = []; return obj; }
function strip(o) { const c = { ...o }; delete c._urls; return c; }
