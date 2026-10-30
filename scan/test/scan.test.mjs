// Offline tests: no API key or network needed. Claude's replies are mocked.
// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanInput, normalizeBrief } from "../lib/validate.js";
import { runScan } from "../lib/pipeline.js";
import { parseJson } from "../lib/claude.js";
import { onRequestPost } from "../../functions/api/scan.js";

const SITE = {
  business_name: "Test Studio", summary: "A pottery studio offering classes.",
  pages: [{ url: "https://teststudio.com/", title: "Home", loaded: true }],
  observations: [{ id: "s1", text: "Contact page lists email and Instagram.", url: "https://teststudio.com/contact" }],
  gaps: [], limits: [],
};
const PEERS = { peers: [{ name: "Peer Clay", url: "https://peerclay.com", origin: "named_by_founder", why_comparable: "Same classes.", practices: [{ id: "p1", text: "Offers a class finder quiz.", url: "https://peerclay.com/classes" }] }], not_found: [], limits: [] };
const DRAFT = {
  business: "Test Studio", summary: "Inquiries are scattered.", notes: "",
  opportunities: [
    { id: "intake", top: true, category: "Programs & Workflows", title: "One intake path for inquiries — email and DMs", why: "Inquiries get lost.", prompted: [["site", "Two contact routes."], ["told", "Questions get lost."]], build: "A single form.", experiment: "Two weeks, one form.", effort: ["Low", "Existing tools."], value: ["High", "Every customer."], sources: ["https://teststudio.com/contact", "https://made-up.example/x"], validate: ["Volume"] },
    { id: "quiz", top: true, category: "Products & Offerings", title: "A class finder", why: "Fewer repeat questions.", prompted: [["peer", "Peer has a quiz."]], build: "Short quiz.", experiment: "Table of top five questions.", effort: ["Low", "Writing."], value: ["Medium", "Fewer emails."], sources: ["https://peerclay.com/classes"], validate: ["Top questions"] },
    { id: "bad", category: "Nonsense", title: "Bad category", prompted: [["site", "x"]] },
    { id: "nothing", category: "Admin & Operations", title: "No evidence", prompted: [] },
  ],
};

function mockClaude(replies) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    if (!String(url).includes("api.anthropic.com")) throw new Error("unexpected fetch " + url);
    const body = JSON.parse(init.body);
    calls.push(body);
    const next = replies.shift();
    return new Response(JSON.stringify({ stop_reason: next.stop || "end_turn", content: next.content || [{ type: "text", text: JSON.stringify(next.json) }], usage: { input_tokens: 10, output_tokens: 5 } }), { status: 200 });
  };
  return { fetchImpl, calls };
}

const validRaw = { website: "teststudio.com", room: "Creative work", stuck: "Questions by email get lost.", admire: "Peer Clay", consent: true, email: "a@b.co" };

test("cleanInput normalizes the URL and requires consent", () => {
  const { input, errors } = cleanInput(validRaw);
  assert.equal(errors.length, 0);
  assert.equal(input.website, "https://teststudio.com");
  assert.equal(input.domain, "teststudio.com");
  assert.ok(cleanInput({ ...validRaw, consent: false }).errors.length);
  assert.ok(cleanInput({ ...validRaw, website: "http://localhost:8080" }).errors.length);
  assert.ok(cleanInput({ stuck: "x", consent: true }).errors.length, "needs website or description");
  assert.equal(cleanInput({ stuck: "x", consent: true, describe: "A bakery" }).errors.length, 0, "no-website route works");
});

test("normalizeBrief drops unsupported items, bad sources, and em dashes", () => {
  const { brief, problems } = normalizeBrief(DRAFT, ["https://teststudio.com/contact", "https://peerclay.com/classes"]);
  assert.equal(brief.opportunities.length, 2);
  assert.ok(!brief.opportunities[0].title.includes("—"));
  assert.deepEqual(brief.opportunities[0].sources, ["https://teststudio.com/contact"]);
  assert.ok(problems.some((p) => p.includes("unknown category")));
  assert.ok(problems.some((p) => p.includes("nothing prompted it")));
  assert.equal(brief.sample, false);
});

test("normalizeBrief caps at 10 items and 3 top picks", () => {
  const many = { opportunities: Array.from({ length: 14 }, (_, i) => ({ id: "o" + i, top: true, category: "Admin & Operations", title: "Item " + i, prompted: [["told", "said so"]] })) };
  const { brief } = normalizeBrief(many, []);
  assert.equal(brief.opportunities.length, 10);
  assert.equal(brief.opportunities.filter((o) => o.top).length, 3);
});

test("parseJson tolerates text around the JSON", () => {
  assert.deepEqual(parseJson('Here you go:\n{"a":1}\nThanks'), { a: 1 });
  assert.throws(() => parseJson("no json"));
});

test("runScan runs all four stages with the right tools and limits", async () => {
  const { fetchImpl, calls } = mockClaude([{ json: SITE }, { json: PEERS }, { json: DRAFT }, { json: DRAFT }]);
  const { input } = cleanInput(validRaw);
  const out = await runScan(input, { ANTHROPIC_API_KEY: "test" }, { fetchImpl });
  assert.equal(calls.length, 4);
  const fetchTool = calls[0].tools.find((t) => t.name === "web_fetch");
  assert.deepEqual(fetchTool.allowed_domains, ["teststudio.com", "www.teststudio.com"], "stage 1 may only fetch the visitor's domain");
  assert.ok(calls[1].tools.some((t) => t.name === "web_search"), "stage 2 can search");
  assert.ok(!calls[2].tools && !calls[3].tools, "synthesis and review have no tools");
  assert.equal(out.brief.opportunities.length, 2);
  assert.deepEqual(out.brief.opportunities[0].sources, ["https://teststudio.com/contact"]);
});

test("runScan follows pause_turn continuations", async () => {
  const { fetchImpl, calls } = mockClaude([
    { stop: "pause_turn", content: [{ type: "server_tool_use", id: "x", name: "web_fetch", input: {} }] },
    { json: SITE }, { json: PEERS }, { json: DRAFT }, { json: DRAFT },
  ]);
  const { input } = cleanInput(validRaw);
  await runScan(input, { ANTHROPIC_API_KEY: "test" }, { fetchImpl });
  assert.equal(calls.length, 5);
  assert.equal(calls[1].messages.length, 2, "paused turn is sent back unchanged");
});

test("no-website route skips the site stage", async () => {
  const { fetchImpl, calls } = mockClaude([{ json: PEERS }, { json: DRAFT }, { json: DRAFT }]);
  const { input } = cleanInput({ describe: "A pottery studio", stuck: "Questions get lost", consent: true, admire: "Peer Clay" });
  await runScan(input, { ANTHROPIC_API_KEY: "test" }, { fetchImpl });
  assert.equal(calls.length, 3);
});

test("API refuses when switched off, unguarded, or missing fields", async () => {
  const req = (body) => new Request("https://kernel-collective.com/api/scan", { method: "POST", headers: { "content-type": "application/json", origin: "https://kernel-collective.com" }, body: JSON.stringify(body) });
  let r = await onRequestPost({ request: req(validRaw), env: {} });
  assert.equal(r.status, 503);
  r = await onRequestPost({ request: req({ website: "x.com" }), env: { SCAN_ENABLED: "true" } });
  assert.equal(r.status, 422);
  r = await onRequestPost({ request: req(validRaw), env: { SCAN_ENABLED: "true", ANTHROPIC_API_KEY: "k" } });
  const d = await r.json();
  assert.equal(r.status, 500);
  assert.ok(!JSON.stringify(d).includes("k\""), "no secrets leak");
});

test("API returns a ready brief when human review is off", async () => {
  const { fetchImpl } = mockClaude([{ json: SITE }, { json: PEERS }, { json: DRAFT }, { json: DRAFT }]);
  const realFetch = globalThis.fetch; globalThis.fetch = fetchImpl;
  try {
    const request = new Request("https://kernel-collective.com/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validRaw) });
    const r = await onRequestPost({ request, env: { SCAN_ENABLED: "true", HUMAN_REVIEW: "false", ALLOW_UNGUARDED: "true", ANTHROPIC_API_KEY: "k" } });
    const d = await r.json();
    assert.equal(d.status, "ready");
    assert.equal(d.brief.opportunities.length, 2);
  } finally { globalThis.fetch = realFetch; }
});

test("API queues for human review and stores the brief", async () => {
  const { fetchImpl } = mockClaude([{ json: SITE }, { json: PEERS }, { json: DRAFT }, { json: DRAFT }]);
  const store = new Map();
  const kv = { get: async (k) => store.get(k) || null, put: async (k, v) => store.set(k, v) };
  const realFetch = globalThis.fetch; globalThis.fetch = fetchImpl;
  try {
    const request = new Request("https://kernel-collective.com/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validRaw) });
    const r = await onRequestPost({ request, env: { SCAN_ENABLED: "true", SCAN_KV: kv, ANTHROPIC_API_KEY: "k" } });
    const d = await r.json();
    assert.equal(d.status, "queued");
    assert.ok([...store.keys()].some((k) => k.startsWith("brief:")));
    assert.ok([...store.keys()].some((k) => k.endsWith(":all")), "daily counter recorded");
  } finally { globalThis.fetch = realFetch; }
});
