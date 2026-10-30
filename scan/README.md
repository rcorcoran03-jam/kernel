# Kernel Opportunity Scan

The live version of the Opportunity Scan on `Lab.html`. A visitor's answers go to a server function, which reads their public website, researches businesses they named, and writes a labeled opportunity brief. By default, every brief goes to Kernel for a human review before the visitor sees it.

Nothing here is live until you finish the setup below. Until then, the Lab page keeps showing the fictional sample brief.

## Where everything lives

```
kernel website/
  wrangler.toml            Cloudflare Pages settings (no secrets)
  package.json             test, dev, and deploy commands
  .dev.vars.example        template for local secrets (copy to .dev.vars)
  deploy/                  the website (Lab.html, lab.js, lab.css, ...)
  functions/api/scan.js    the API: POST /api/scan
  scan/
    prompts/               the four prompts, one per stage (edit these to tune the scan)
      site-observations.js
      competitive-scan.js
      opportunity-synthesis.js
      review-pass.js
    lib/
      claude.js            calls the Claude API from the server
      pipeline.js          runs the four stages in order
      validate.js          cleans input; enforces the brief's shape and rules in code
      guard.js             bot check and daily limits
      notify.js            stores briefs and emails them to Kernel
    test/scan.test.mjs     offline tests (no key needed)
```

## How a scan runs

1. **Site observations.** Claude fetches the homepage and up to five more pages, and only on the visitor's own domain. It records what a visitor can see, each with its page URL. If there's no website, this stage is skipped and the visitor's description is used instead.
2. **Competitive scan.** Claude searches for and reads up to three businesses: the ones the visitor named, or, if they allowed it, a couple of comparable peers. Every practice it records includes a URL.
3. **Opportunity synthesis.** Using no tools, Claude writes up to 10 opportunities from the visitor's answers plus stages 1 and 2. Each prompt that led to an opportunity is labeled website, told us, peer, or hypothesis, and the strongest three are marked.
4. **Review pass.** A second read checks every claim against the evidence. It relabels or removes anything unsupported, strips invented numbers and padding, and notes what it changed.
5. **Code checks** (`validate.js`). These run after the AI steps no matter what the model returned:
   - at most 10 opportunities, with at most three marked strongest
   - only the three Kernel categories
   - sources limited to URLs that appeared in the evidence
   - no em dashes

All the website-reading stages treat page text as content to describe, never as instructions. The writing and review stages have no web access.

## Setup, step by step

1. **Put the site on Cloudflare Pages.** In the Cloudflare dashboard, go to Workers & Pages, then Create, then Pages. Either connect a GitHub repo holding this folder, or upload it with `npx wrangler pages deploy` from this folder. The `functions` folder must sit next to `deploy`, as it does here.
2. **Get a Claude API key** at console.anthropic.com. Add it as a secret, not a variable:
   `npx wrangler pages secret put ANTHROPIC_API_KEY`
   Set a monthly spend limit on the Anthropic account as a backstop.
3. **Turn on the bot check.** In Cloudflare, go to Turnstile and add a widget for your domain.
   - Put the secret key on the server: `npx wrangler pages secret put TURNSTILE_SECRET`
   - Paste the site key, which is public, into `TURNSTILE_SITE_KEY` at the top of `deploy/lab.js`.
4. **Create storage for limits and briefs.**
   - Run `npx wrangler kv namespace create SCAN_KV`.
   - Paste the id it gives you into the commented `[[kv_namespaces]]` block in `wrangler.toml`, then uncomment the block.
5. **Set up email for human review.** See "Email with Resend" below.
6. **Check the settings in `wrangler.toml`:**
   - `ALLOWED_ORIGIN`: your live site address
   - `MAX_SCANS_PER_IP_PER_DAY` and `MAX_SCANS_PER_DAY`
   - `SCAN_MODEL`
7. **Test before switching on** (see below).
8. **Switch on:**
   - Set `SCAN_ENABLED = "true"` in `wrangler.toml`.
   - Set `SCAN_ENDPOINT = "/api/scan"` in `deploy/lab.js`.
   - Update the FAQ answer "When will the Opportunity Scan be live?" in `Lab.html`.
   - Deploy.

   In live mode the page shows the email, consent, and bot-check fields, changes the banner copy, and relabels the button "Run my scan." The sample brief stays available.

## Email with Resend

Briefs are emailed to `NOTIFY_EMAIL` (hello@kernel-collective.com) from `FROM_EMAIL` (scan@notify.kernel-collective.com). Resend recommends sending from a subdomain, and this one only sends. It doesn't touch the hello@ inbox or its mail settings.

1. **Make sure hello@ receives mail.** Send it a message from your personal email. If nothing arrives, set up Cloudflare Email Routing for kernel-collective.com first.
2. **Create a Resend account** at resend.com. The free plan allows 100 emails a day, well above the 25-scan daily cap.
3. **Add the domain.**
   - In Resend, go to Domains, then Add Domain, and enter `notify.kernel-collective.com`.
   - Choose **Sign in to Cloudflare** and approve. Resend adds its records for you: an MX and a TXT record under `send.notify`, and a DKIM TXT record.
   - Leave "Receiving" off.
4. **Verify.** Wait for the domain to show Verified in Resend. This is often quick but can take longer.
5. **Create an API key.**
   - In Resend, go to API Keys, then Create, and choose **Sending access**, limited to `notify.kernel-collective.com`.
   - Copy the key. Resend shows it only once.
6. **Test it from your computer.**
   - Copy `.dev.vars.example` to `.dev.vars` and fill in `RESEND_API_KEY`.
   - Run `npm install` once, then `npm run test-email`. A sample brief email should arrive at hello@.
7. **Add the key to the live site:** `npx wrangler pages secret put RESEND_API_KEY`

If you would rather send from the main domain, verify `kernel-collective.com` in Resend instead and change `FROM_EMAIL` to an address on it, in both `wrangler.toml` and `.dev.vars`.

## Testing

- **Offline tests.** Run `npm install`, then `npm test`. The tests mock Claude's replies and check:
  - input cleaning, consent, and the no-website route
  - each stage's tools, including that stage 1 can only fetch the visitor's domain
  - pauses during web searches
  - the brief rules
  - that the API refuses to run when it's switched off or unguarded
  - both review modes
- **Local run with real calls.**
  1. Copy `.dev.vars.example` to `.dev.vars` and add your key.
  2. Run `npm run dev`.
  3. Temporarily set `SCAN_ENDPOINT = "/api/scan"` in `lab.js` and open the local address it prints.
- **Benchmark on sites you know.** Run lunisaarts.com and frenchdetours.com through it. You know the real answers there, so it's the fastest way to spot weak or invented points. Tune the prompts in `scan/prompts/`, not the code.

## Running costs

Each scan makes four Claude calls. The first two read web pages, which count as input tokens, and the second also runs web searches. Anthropic currently bills web search at $10 per 1,000 searches, on top of token costs, and web fetch at token cost only. Stage 1 is capped at 6 page fetches, and stage 2 at 5 searches and 6 fetches. The daily caps in `wrangler.toml` bound total spend. Check real costs in the Anthropic console after your first test runs, before raising the limits.

To lower costs, set `SCAN_RESEARCH_MODEL` to a smaller model for stages 1 and 2, and keep `SCAN_WRITER_MODEL` on a stronger one.

## Human review (default)

With `HUMAN_REVIEW = "true"`, the visitor sees: "Your brief is with Kernel for a quick human review." You get an email with the full brief, a list of any automatic fixes, and the visitor's email as the reply-to address. Edit as needed and reply. The stored copy, including the draft and all evidence, stays in `SCAN_KV` under `brief:<id>` for 30 days.

When you trust the output, set `HUMAN_REVIEW = "false"`. Briefs then appear on the page right away, labeled "first draft to validate."

## Not built yet

- A private page for reviewing and editing stored briefs. For now, review happens by email.
- Background processing. A scan runs while the visitor waits, usually one to two minutes, so the page asks them to keep it open.
- Saving a brief to a shareable link.
