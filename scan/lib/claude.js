// Minimal Claude Messages API client for Cloudflare Workers / Pages Functions.
// The API key is read from env.ANTHROPIC_API_KEY on the server. It is never
// sent to the browser.

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

export const TOOLS = {
  fetch: (opts = {}) => ({ type: "web_fetch_20250910", name: "web_fetch", ...opts }),
  search: (opts = {}) => ({ type: "web_search_20250305", name: "web_search", ...opts }),
};

/**
 * Call Claude, following server-tool pauses until the turn ends.
 * Returns { text, urls, usage, stopReason }.
 */
export async function callClaude({ env, model, system, user, tools, maxTokens = 4000, fetchImpl = fetch, maxContinuations = 4 }) {
  if (!env.ANTHROPIC_API_KEY) throw new ScanError("config", "ANTHROPIC_API_KEY is not set.");
  const messages = [{ role: "user", content: user }];
  const urls = new Set();
  const usage = { input_tokens: 0, output_tokens: 0, web_search_requests: 0 };
  let text = "";
  let stopReason = null;

  for (let i = 0; i <= maxContinuations; i++) {
    const body = { model, max_tokens: maxTokens, system, messages };
    if (tools && tools.length) body.tools = tools;
    const res = await fetchImpl(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": API_VERSION },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new ScanError("upstream", `Claude API error ${res.status}`, detail.slice(0, 500));
    }
    const data = await res.json();
    stopReason = data.stop_reason;
    if (data.usage) {
      usage.input_tokens += data.usage.input_tokens || 0;
      usage.output_tokens += data.usage.output_tokens || 0;
      const st = data.usage.server_tool_use || {};
      usage.web_search_requests += st.web_search_requests || 0;
    }
    for (const block of data.content || []) {
      if (block.type === "text") text += block.text;
      collectUrls(block, urls);
    }
    if (stopReason !== "pause_turn") break;
    // Send the paused assistant turn back unchanged so Claude can continue.
    messages.push({ role: "assistant", content: data.content });
  }
  return { text, urls: [...urls], usage, stopReason };
}

function collectUrls(block, urls) {
  if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
    block.content.forEach((r) => r && r.url && urls.add(r.url));
  }
  if (block.type === "web_fetch_tool_result" && block.content && block.content.url) {
    urls.add(block.content.url);
  }
  if (block.type === "text" && Array.isArray(block.citations)) {
    block.citations.forEach((c) => c && c.url && urls.add(c.url));
  }
}

/** Pull the first JSON object out of a model reply. */
export function parseJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new ScanError("format", "The model did not return JSON.");
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    throw new ScanError("format", "The model returned malformed JSON.");
  }
}

export class ScanError extends Error {
  constructor(kind, message, detail) {
    super(message);
    this.kind = kind;
    this.detail = detail;
  }
}
