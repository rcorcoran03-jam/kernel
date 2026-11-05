// Offline tests: no API key or network needed. Claude's replies are mocked.
// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanInput, normalizeBrief } from "../lib/validate.js";
import { runScan } from "../lib/pipeline.js";
import { parseJson } from "../lib/claude.js";
import { onRequestPost } from "../../functions/api/scan.js";
import { onRequestPost as stepPost } from "../../functions/api/scan-step.js";
import { onRequestGet as briefGet } from "../../functions/api/brief.js";
import { onRequestGet as approveGet, onRequestPost as approvePost } from "../../functions/api/brief-approve.js";
import { briefEmailHtml } from "../lib/notify.js";
import { onRequestGet as hqGet, onRequestPost as hqPost } from "../../functions/api/hq.js";
import { onRequestPost as inquiryPost } from "../../functions/api/inquiry.js";
import { scoreTarget, proposalTotals, cleanProposal } from "../lib/hq.js";

const SITE = {
  business_name: "Test Studio", summary: "A pottery studio offering classes.", tools_seen: [{ name: "Squarespace", role: "site", url: "https://teststudio.com/" }],
  pages: [{ url: "https://teststudio.com/", title: "Home", loaded: true }],
  observations: [{ id: "s1", text: "Contact page lists email and Instagram.", url: "https://teststudio.com/contact" }],
  gaps: [], limits: [],
};
const PEERS = { peers: [{ name: "Peer Clay", url: "https://peerclay.com", origin: "named_by_founder", why_comparable: "Same classes.", practices: [{ id: "p1", text: "Offers a class finder quiz.", url: "https://peerclay.com/classes" }] }], not_found: [], limits: [] };
const DRAFT = {
  business: "Test Studio", summary: "Inquiries are scattered.", notes: "",
  opportunities: [
    { id: "intake", top: true, category: "Programs & Workflows", title: "One intake path for inquiries — email and DMs", why: "Inquiries get lost.", prompted: [["site", "Two contact routes."], ["told", "Questions get lost."]], build: "A single form.", experiment: "Two weeks, one form.", complexity: [1, "Existing tools."], value: [3, "Every customer."], tools: [["Squarespace", "have"], ["Typeform", "have"], ["Intake form", "build"]], needs: ["One official channel"], obstacles: ["Old links keep working"], sources: ["https://teststudio.com/contact", "https://made-up.example/x"], validate: ["Volume"] },
    { id: "quiz", top: true, category: "Products & Offerings", title: "A class finder", why: "Fewer repeat questions.", prompted: [["peer", "Peer has a quiz."]], build: "Short quiz.", experiment: "Table of top five questions.", effort: ["Low", "Writing."], value: ["Medium", "Fewer emails."], sources: ["https://peerclay.com/classes"], validate: ["Top questions"] },
    { id: "bad", category: "Nonsense", title: "Bad category", prompted: [["site", "x"]] },
    { id: "nothing", category: "Admin & Operations", title: "No evidence", prompted: [] },
  ],
  foundations: [{ item: "A written deposit policy", for: "deposits" }],
  pitfalls: ["Switching every channel at once."],
  inspiration: { themes: [{ theme: "Help people choose", detail: "Both peers guide class choice.", peers: ["Peer Clay"], opportunity: "quiz" }],
    profiles: [{ name: "Peer Clay", url: "https://peerclay.com", moat: "A class finder quiz.", offers: [["Classes", "seen"]], tech_stack: [{ text: "Shopify", basis: "maybe" }], borrow: "A quiz.", stand_apart: "Parties." }, { name: "Invented Co", moat: "x" }] },
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

test("API with KV starts a job instead of running everything", async () => {
  const { fetchImpl } = mockClaude([{ json: SITE }, { json: PEERS }, { json: DRAFT }, { json: DRAFT }]);
  const store = new Map();
  const kv = { get: async (k) => store.get(k) || null, put: async (k, v) => store.set(k, v) };
  const realFetch = globalThis.fetch; globalThis.fetch = fetchImpl;
  try {
    const request = new Request("https://kernel-collective.com/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validRaw) });
    const r = await onRequestPost({ request, env: { SCAN_ENABLED: "true", SCAN_KV: kv, ANTHROPIC_API_KEY: "k" } });
    const d = await r.json();
    assert.equal(d.status, "started");
    assert.ok([...store.keys()].some((k) => k.startsWith("job:")));
    assert.ok([...store.keys()].some((k) => k.endsWith(":all")), "daily counter recorded");
  } finally { globalThis.fetch = realFetch; }
});

test("v2 brief: ratings, tools, inspiration, foundations", () => {
  const { brief, problems } = normalizeBrief(DRAFT, [], { haveTools: ["Squarespace"], peerNames: ["Peer Clay"] });
  const o = brief.opportunities[0];
  assert.deepEqual(o.value[0], 3); assert.deepEqual(o.complexity[0], 1);
  assert.deepEqual(o.tools.map((t) => t[1]), ["have", "add", "build"], "unknown have tool becomes add");
  assert.equal(brief.opportunities[1].complexity[0], 1, "old effort words map to 1-3");
  assert.equal(brief.inspiration.profiles.length, 1, "profiles not in the research are dropped");
  assert.deepEqual(brief.inspiration.profiles[0].tech_stack, [["Shopify", "inferred"]]);
  assert.equal(brief.inspiration.themes[0].opportunity, "quiz");
  assert.equal(brief.foundations[0].item, "A written deposit policy");
  assert.ok(problems.some((p) => p.includes("relabeled")));
  assert.ok(briefEmailHtml({}, brief, { eyebrow: "x", heading: "y", intro: "z", ctaHref: "https://a", ctaLabel: "Go" }).includes("A good place to start"));
});

test("stepwise flow: start, one stage per step, review, approve, founder link", async () => {
  const { fetchImpl } = mockClaude([{ json: SITE }, { json: PEERS }, { json: DRAFT }, { json: DRAFT }]);
  const store = new Map(); const sent = [];
  const kv = { get: async (k) => store.get(k) || null, put: async (k, v) => store.set(k, v) };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => { if (String(url).includes("resend.com")) { sent.push(JSON.parse(init.body)); return new Response("{}", { status: 200 }); } return fetchImpl(url, init); };
  const env = { SCAN_ENABLED: "true", SCAN_KV: kv, ANTHROPIC_API_KEY: "k", RESEND_API_KEY: "r", FROM_EMAIL: "Kernel <scan@x.com>", NOTIFY_EMAIL: "hello@x.com" };
  const post = (url, body) => new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  try {
    let d = await (await onRequestPost({ request: post("https://k.com/api/scan", validRaw), env })).json();
    assert.equal(d.status, "started"); assert.deepEqual(d.stages, ["site", "peers", "synthesis", "review"]);
    const { id, key } = d;
    const bad = await stepPost({ request: post("https://k.com/api/scan-step", { id, key: "wrong" }), env });
    assert.equal(bad.status, 404, "wrong key is refused");
    const seenNext = [];
    for (let i = 0; i < 4; i++) { d = await (await stepPost({ request: post("https://k.com/api/scan-step", { id, key }), env })).json(); seenNext.push(d.next || d.status); }
    assert.deepEqual(seenNext, ["peers", "synthesis", "review", "queued"]);
    assert.equal(sent.length, 1, "Kernel was emailed"); assert.ok(sent[0].html.includes("Review and send"));
    const rec = JSON.parse(store.get("brief:" + id));
    let r = await briefGet({ request: new Request(`https://k.com/api/brief?id=${id}&t=${rec.viewToken}`), env });
    assert.equal(r.status, 404, "founder link waits for approval");
    r = await approveGet({ request: new Request(`https://k.com/api/brief-approve?id=${id}&t=${rec.approveToken}`), env });
    assert.ok((await r.text()).includes("Send to a@b.co"), "GET only shows a confirm page");
    const fd = new FormData(); fd.append("id", id); fd.append("t", rec.approveToken);
    r = await approvePost({ request: new Request("https://k.com/api/brief-approve", { method: "POST", body: fd }), env });
    assert.equal(r.status, 200); assert.equal(sent.length, 2); assert.deepEqual(sent[1].to, ["a@b.co"]);
    r = await briefGet({ request: new Request(`https://k.com/api/brief?id=${id}&t=${rec.viewToken}`), env });
    const b = await r.json(); assert.equal(b.status, "ok"); assert.equal(b.brief.version, 2);
  } finally { globalThis.fetch = realFetch; }
});

test("parseJson handles fences, prose braces, and picks the real object", () => {
  assert.deepEqual(parseJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(parseJson('Notes {not json} then {"b":{"c":2}} done'), { b: { c: 2 } });
  assert.throws(() => parseJson('{"a": "unterminated'), /malformed/);
});

test("a malformed stage reply gets one repair call", async () => {
  const { fetchImpl, calls } = mockClaude([
    { content: [{ type: "text", text: '{"business_name": "Test", "observations": [ {"id": "s1", "text": "Says "hi" here", "url": "https://teststudio.com/"} ] }' }] },
    { json: SITE }, { json: PEERS }, { json: DRAFT }, { json: DRAFT },
  ]);
  const { input } = cleanInput(validRaw);
  const out = await runScan(input, { ANTHROPIC_API_KEY: "test" }, { fetchImpl });
  assert.equal(calls.length, 5, "one extra call to repair the JSON");
  assert.ok(calls[1].system.includes("You fix broken JSON"));
  assert.equal(out.brief.opportunities.length, 2);
});

test("a cut-off reply is reported, not parsed", async () => {
  const { fetchImpl } = mockClaude([{ stop: "max_tokens", content: [{ type: "text", text: '{"business_name": "Te' }] }]);
  const { input } = cleanInput(validRaw);
  await assert.rejects(runScan(input, { ANTHROPIC_API_KEY: "test" }, { fetchImpl }), /ran out of room/);
});

function memKV() {
  const store = new Map();
  return { store,
    get: async (k) => (store.has(k) ? store.get(k).v : null),
    put: async (k, v, o) => store.set(k, { v, m: (o && o.metadata) || null }),
    list: async ({ prefix }) => ({ keys: [...store.keys()].filter((k) => k.startsWith(prefix)).map((k) => ({ name: k, metadata: store.get(k).m })), list_complete: true }),
  };
}

test("HQ refuses without Access, works with it, and scans become leads", async () => {
  const kv = memKV();
  const { fetchImpl } = mockClaude([{ json: SITE }, { json: PEERS }, { json: DRAFT }, { json: DRAFT }, { content: [{ type: "text", text: "Subject: Hi\n\nHello" }] }]);
  const sent = []; const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => { if (String(url).includes("resend.com")) { sent.push(JSON.parse(init.body)); return new Response("{}", { status: 200 }); } return fetchImpl(url, init); };
  const base = { SCAN_ENABLED: "true", SCAN_KV: kv, ANTHROPIC_API_KEY: "k", RESEND_API_KEY: "r", FROM_EMAIL: "K <s@x.com>", NOTIFY_EMAIL: "hello@x.com" };
  const post = (url, body) => new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  try {
    let r = await hqGet({ request: new Request("https://k.com/api/hq"), env: base });
    assert.equal(r.status, 401, "no Access token, no data");
    let d = await (await onRequestPost({ request: post("https://k.com/api/scan", validRaw), env: base })).json();
    for (let i = 0; i < 4; i++) await stepPost({ request: post("https://k.com/api/scan-step", { id: d.id, key: d.key }), env: base });
    const env = { ...base, HQ_DEV_ALLOW: "true", HQ_DEV_USER: "ryan@x.com" };
    let list = await (await hqGet({ request: new Request("https://k.com/api/hq"), env })).json();
    assert.equal(list.leads.length, 1); assert.equal(list.leads[0].src, "scan"); assert.equal(list.leads[0].bs, "pending");
    const id = list.leads[0].id;
    let one = await (await hqGet({ request: new Request("https://k.com/api/hq?id=" + id), env })).json();
    assert.ok(one.brief && one.brief.approveToken, "lead opens its brief");
    let u = await (await hqPost({ request: post("https://k.com/api/hq", { action: "update", id, fields: { stage: "call", nextStep: { text: "Call Tue", due: "2026-11-10" } } }), env })).json();
    assert.equal(u.lead.stage, "call"); assert.ok(u.lead.notes.some((n) => n.kind === "stage"));
    u = await (await hqPost({ request: post("https://k.com/api/hq", { action: "update", id, fields: { stage: "nofit" } }), env })).json();
    assert.equal(u.lead.furthest, "call", "an exit keeps the furthest stage reached");
    u = await (await hqPost({ request: post("https://k.com/api/hq", { action: "update", id, fields: { stage: "call" } }), env })).json();
    u = await (await hqPost({ request: post("https://k.com/api/hq", { action: "send-brief", id }), env })).json();
    assert.equal(u.lead.briefStatus, "sent"); assert.ok(sent.some((m) => m.to[0] === "a@b.co"));
    u = await (await hqPost({ request: post("https://k.com/api/hq", { action: "ai", id, task: "followup" }), env })).json();
    assert.equal(u.status, "ok"); assert.ok(u.lead.notes.some((n) => n.kind === "ai"));
    const f = new FormData(); f.append("form", "lab-inquiry"); f.append("name", "Sam"); f.append("email", "sam@x.co"); f.append("message", "Hello");
    r = await inquiryPost({ request: new Request("https://k.com/api/inquiry", { method: "POST", body: f }), env: base });
    assert.equal(r.status, 200);
    list = await (await hqGet({ request: new Request("https://k.com/api/hq"), env })).json();
    assert.equal(list.leads.length, 2); assert.ok(list.leads.some((l) => l.src === "lab-inquiry"));
    // Suite form: company becomes the business; a repeat email joins the existing lead
    const g = new FormData(); g.append("form", "core-inquiry"); g.append("name", "Ana"); g.append("email", "ana@x.co"); g.append("company", "Ana Studio"); g.append("message", "Suite please");
    await inquiryPost({ request: new Request("https://k.com/api/inquiry", { method: "POST", body: g }), env: base });
    const h = new FormData(); h.append("form", "contact"); h.append("name", "Ana"); h.append("email", "ANA@x.co"); h.append("message", "Also hi");
    await inquiryPost({ request: new Request("https://k.com/api/inquiry", { method: "POST", body: h }), env: base });
    list = await (await hqGet({ request: new Request("https://k.com/api/hq"), env })).json();
    const ana = list.leads.filter((l) => l.e && l.e.toLowerCase() === "ana@x.co");
    assert.equal(ana.length, 1, "repeat email reuses the lead"); assert.equal(ana[0].src, "core-inquiry"); assert.equal(ana[0].b, "Ana Studio");
  } finally { globalThis.fetch = realFetch; }
});

test("teach one bonus: full at target, half at halfway, both directions", () => {
  const t = (o) => cleanProposal({ targets: [{ amount: 750, ...o }] }).targets[0];
  assert.equal(scoreTarget(t({ baseline: 3, target: 1, actual: 1 })).pay, 750, "lower is better, met");
  assert.equal(scoreTarget(t({ baseline: 3, target: 1, actual: 1.5 })).pay, 375, "lower is better, past halfway (2)");
  assert.equal(scoreTarget(t({ baseline: 3, target: 1, actual: 2.5 })).pay, 0, "short of halfway");
  assert.equal(scoreTarget(t({ baseline: 0, target: 80, actual: 60 })).pay, 375, "higher is better, past halfway (40)");
  assert.equal(scoreTarget(t({ kind: "done", done: true })).pay, 750);
  assert.equal(scoreTarget(t({ baseline: 0, target: 80 })).level, "open", "no actual yet");
  const p = cleanProposal({ discovery: 1000, credit: false, lab: 5000, targets: [{ amount: 750, baseline: 3, target: 1, actual: 1 }, { amount: 750, kind: "done" }] });
  assert.deepEqual(proposalTotals(p), { fixed: 6000, maxBonus: 1500, earned: 750, min: 6000, max: 7500, total: 6750 });
});
