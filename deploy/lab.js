/* Kernel Lab: Opportunity Scan
   ------------------------------------------------------------------
   Today this page shows a SAMPLE brief for a fictional business.
   Visitor answers are never analyzed in the browser; they are only
   carried into the inquiry form.

   Live mode: the server function at /functions/api/scan.js runs the
   real scan (see scan/README.md). To switch this page to live mode:
   1. Finish the setup in scan/README.md and set SCAN_ENABLED=true there.
   2. Set SCAN_ENDPOINT below to "/api/scan".
   3. Paste your Turnstile site key (public, safe to include) below.
   API keys stay on the server. Never place them in this file. */
var SCAN_ENDPOINT = "/api/scan";       // "" = sample only. "/api/scan" = live.
var TURNSTILE_SITE_KEY = "0x4AAAAAAFrykI24AUmOXZml";  // public Cloudflare Turnstile site key

var SAMPLE_BRIEF = {
  sample: true,
  "business": "Wren & Ink Studio (fictional)",
  "opportunities": [
    {
      "id": "rules",
      "top": true,
      "category": "Admin & Operations",
      "title": "Sort the useful from the worrying: one page of studio AI ground rules",
      "why": "Unease about what AI means for your work can quietly stall every experiment. Writing down where AI is welcome and where it is not turns a background worry into a decision you control.",
      "prompted": [
        [
          "told",
          "You want to know where AI actually helps without giving your work away."
        ],
        [
          "told",
          "AI is used today only to make promotional images."
        ],
        [
          "hyp",
          "Some image and design tools may use uploaded artwork to train their systems, depending on settings."
        ]
      ],
      "build": "A plain-language studio policy: AI is fine for admin, drafts, and research; it never makes or imitates the artwork. Plus a checklist of the privacy and training settings to switch off in the tools you already use.",
      "experiment": "In one sitting, list every tool that touches your images and check its training and privacy settings.",
      "effort": [
        "Low",
        "An afternoon of reading settings and writing one page."
      ],
      "value": [
        "High",
        "Removes the worry that keeps you from trying anything, and protects the work itself."
      ],
      "sources": [
        "Sample answers (fictional)"
      ],
      "validate": [
        "Which tools hold your images today",
        "What each tool's current terms and settings say"
      ]
    },
    {
      "id": "site",
      "top": true,
      "category": "Products & Offerings",
      "title": "Finish the website by deciding the three jobs it must do",
      "why": "A half-finished site usually keeps growing in scope. Naming its few jobs (sell the current edition, take commission requests, fill the workshop) gives you a finish line.",
      "prompted": [
        [
          "site",
          "The shop page says the new edition is coming soon, and the about page is a placeholder."
        ],
        [
          "told",
          "Finishing the website keeps slipping behind making the work."
        ]
      ],
      "build": "We finish it with you in co-working sessions. AI drafts edition descriptions and image alt text from your own notes, you edit every word, and you leave able to update it yourself.",
      "experiment": "Write the site's three jobs on one page, then cut every planned section that doesn't serve them.",
      "effort": [
        "Medium",
        "Two or three working sessions, mostly writing and decisions."
      ],
      "value": [
        "High",
        "Every sale, commission, and workshop sign-up passes through it."
      ],
      "sources": [
        "Sample site: wrenandink.example/shop and /about (fictional)"
      ],
      "validate": [
        "Which website platform you're on",
        "Where sales come from today"
      ]
    },
    {
      "id": "commission",
      "top": true,
      "category": "Programs & Workflows",
      "title": "Turn commission emails into a short intake form and a reply you approve",
      "why": "Commissions arrive as open-ended emails, so each one starts with the same back-and-forth before any real work begins.",
      "prompted": [
        [
          "site",
          "The commissions page says to email to discuss, with no details requested."
        ],
        [
          "told",
          "Keeping up with commission emails is one of the things that slips."
        ]
      ],
      "build": "A short request form (subject, size, deadline, budget range) and a reply template in your own voice that AI fills in from the request. Nothing is sent until you read and approve it.",
      "experiment": "Send your next five commission requests through a simple form and note what you'd still ask them.",
      "effort": [
        "Low",
        "A form and one template."
      ],
      "value": [
        "High",
        "Saves time on every commission and sets expectations before you quote."
      ],
      "sources": [
        "Sample site: wrenandink.example/commissions (fictional)"
      ],
      "validate": [
        "How many commission requests arrive a month",
        "Which details you always need before quoting"
      ]
    },
    {
      "id": "drop",
      "category": "Products & Offerings",
      "title": "Use AI to plan an edition launch, not to make the art",
      "why": "You already use AI for promotional images. The bigger help may be the planning and writing around a launch, built from your own process photos and notes.",
      "prompted": [
        [
          "site",
          "Both admired printmakers announce limited editions to an email list before posting them anywhere else."
        ],
        [
          "told",
          "AI is used today only to make promotional images."
        ],
        [
          "hyp",
          "The mailing list may exist but rarely be used."
        ]
      ],
      "build": "A reusable launch kit: a short email sequence, captions, and a timeline, drafted with AI from your own words and photos, then edited by you.",
      "experiment": "Plan the next edition launch end to end in one session, using only your own process photos.",
      "effort": [
        "Low to medium",
        "One planning session, then reuse for every edition."
      ],
      "value": [
        "Medium",
        "Depends on the size of your list and how often you release work."
      ],
      "sources": [
        "Sample admired printmakers (fictional)"
      ],
      "validate": [
        "Whether a mailing list exists and how big it is",
        "How often new editions come out"
      ]
    },
    {
      "id": "workshop",
      "category": "Programs & Workflows",
      "title": "Package the monthly workshop so it runs without rebuilding it each time",
      "why": "Teaching is part of the business, but each session gets re-planned from scratch: sign-ups, materials, reminders, and the handout.",
      "prompted": [
        [
          "site",
          "The workshop is listed monthly, with sign-ups taken by direct message."
        ],
        [
          "hyp",
          "Materials lists and reminders may be rewritten for every session."
        ]
      ],
      "build": "A workshop kit: one sign-up page, automatic reminders, a materials checklist, and a handout template you refine each time.",
      "experiment": "After the next workshop, write down every task it took and mark the ones you've done before.",
      "effort": [
        "Medium",
        "Depends on how sign-ups and payment work today."
      ],
      "value": [
        "Medium",
        "Frees a day a month, and makes the workshop easier to grow."
      ],
      "sources": [
        "Sample site: wrenandink.example/workshops (fictional)"
      ],
      "validate": [
        "How sign-ups and payment work now",
        "Whether you want to run it more often"
      ]
    },
    {
      "id": "sunday",
      "category": "Admin & Operations",
      "title": "A Sunday studio sheet: orders to ship, commission deadlines, workshop sign-ups",
      "why": "When the week's commitments live in your inbox and your head, studio time gets interrupted by remembering.",
      "prompted": [
        [
          "told",
          "You don't have time to finish your own work, let alone experiment."
        ],
        [
          "hyp",
          "Orders, commissions, and sign-ups live in three different places."
        ]
      ],
      "build": "A one-page weekly summary pulled from your shop, inbox, and workshop sign-ups, so Monday starts with a plan instead of a search.",
      "experiment": "Keep the sheet by hand for four Sundays to learn what belongs on it before automating anything.",
      "effort": [
        "Medium",
        "Needs access to two or three tools."
      ],
      "value": [
        "Medium",
        "Protects making time; fewer dropped commitments."
      ],
      "sources": [],
      "validate": [
        "Which tools hold orders and sign-ups",
        "What you check each week today"
      ]
    }
  ]
};

(function () {
  var EV = { site: ["ev-site", "On the website"], told: ["ev-told", "You told us"], peer: ["ev-peer", "Peer research"], hyp: ["ev-hyp", "Hypothesis"] };
  var LIVE = !!SCAN_ENDPOINT;
  var sampleHead = {};
  var CATS = ["Products & Offerings", "Programs & Workflows", "Admin & Operations"];
  var state = {}; // id -> { selected:bool, status:"" | "doing" | "irrelevant" }
  var brief = null;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function safeStore(key, val) { try { if (val === undefined) return sessionStorage.getItem(key); sessionStorage.setItem(key, val); } catch (e) { return null; } }

  /* ---------- scan form ---------- */
  var form = document.getElementById("scan-form");
  var noSite = document.getElementById("scan-nosite");
  var siteField = document.getElementById("field-site");
  var describeField = document.getElementById("field-describe");
  var roomOther = document.getElementById("field-room-other");
  var status = document.getElementById("scan-status");
  var submitBtn = document.getElementById("scan-submit");
  ["brief-tag", "brief-title", "brief-intro", "brief-inputs", "brief-close"].forEach(function (id) { var n = document.getElementById(id); if (n) sampleHead[id] = n.innerHTML; });

  if (LIVE) {
    document.querySelectorAll(".live-only").forEach(function (n) { n.hidden = false; });
    var bt = document.getElementById("banner-text");
    if (bt) bt.innerHTML = "<strong>Your scan reads only your public website and the businesses you name.</strong> It can&rsquo;t see how your business runs inside, so every point is labeled by where it came from, and guesses are marked as hypotheses. The sample brief shows what you&rsquo;ll get.";
    if (submitBtn) submitBtn.textContent = "Run my scan";
    if (TURNSTILE_SITE_KEY) {
      var ts = document.createElement("script");
      ts.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=kernelTurnstile";
      ts.async = true; ts.defer = true;
      window.kernelTurnstile = function () { if (window.turnstile) window.turnstile.render("#scan-turnstile", { sitekey: TURNSTILE_SITE_KEY, theme: "light" }); };
      document.head.appendChild(ts);
    }
  }

  if (noSite) noSite.addEventListener("change", function () {
    describeField.hidden = !noSite.checked;
    siteField.style.opacity = noSite.checked ? "0.5" : "";
    document.getElementById("scan-site").disabled = noSite.checked;
    if (noSite.checked) document.getElementById("scan-describe").focus();
  });
  if (form) form.addEventListener("change", function (e) {
    if (e.target.name === "room") roomOther.hidden = e.target.value !== "Other";
  });

  function scanAnswers() {
    if (!form) return [];
    var f = form.elements, out = [];
    var site = f.website.value.trim();
    if (noSite.checked) out.push("No website yet" + (f.describe.value.trim() ? ": " + f.describe.value.trim() : ""));
    else if (site) out.push("Website: " + site);
    var room = form.querySelector("input[name=room]:checked");
    if (room) out.push("More room for: " + (room.value === "Other" ? (f.room_other.value.trim() || "Something else") : room.value));
    if (f.stuck.value.trim()) out.push("Keeps slipping: " + f.stuck.value.trim());
    if (f.admire.value.trim()) out.push("Admires: " + f.admire.value.trim());
    if (f.tools.value.trim()) out.push("Tools: " + f.tools.value.trim());
    if (f.team.value.trim()) out.push("Who does the work: " + f.team.value.trim());
    return out;
  }

  function say(msg, bad) { status.textContent = msg; status.style.color = bad ? "#B3541E" : ""; }

  function runLive() {
    var f = form.elements;
    var payload = {
      website: noSite.checked ? "" : f.website.value.trim(), describe: f.describe.value.trim(),
      room: (form.querySelector("input[name=room]:checked") || {}).value || "", room_other: f.room_other.value.trim(),
      stuck: f.stuck.value.trim(), admire: f.admire.value.trim(), tools: f.tools.value.trim(), team: f.team.value.trim(),
      location: f.location.value.trim(), allowDiscovery: f.allowDiscovery.checked,
      name: f.name.value.trim(), email: f.email.value.trim(), consent: f.consent.checked,
      turnstileToken: (form.querySelector("[name=cf-turnstile-response]") || {}).value || ""
    };
    if (!payload.stuck) { say("Tell us what keeps slipping first.", true); f.stuck.focus(); return; }
    if (!payload.website && !payload.describe) { say("Add your website, or describe your business.", true); return; }
    if (!payload.consent) { say("Please tick the box so we can read your public website.", true); f.consent.focus(); return; }
    safeStore("kernelScanAnswers", JSON.stringify(scanAnswers()));
    updateCarry();
    submitBtn.disabled = true; submitBtn.setAttribute("aria-busy", "true");
    say("Running your scan. This usually takes one to two minutes, so please keep this page open.");
    fetch(SCAN_ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return { status: "error" }; }); })
      .then(function (d) {
        if (d.status === "ready" && d.brief) { say("Your brief is ready below. Treat it as a first draft: check each point against what you know."); showBrief(d.brief, payload); }
        else if (d.status === "queued") say(d.message || "Your brief is with Kernel for a quick review. We'll email it to you.");
        else if (d.status === "invalid") say((d.errors || ["Please check the form."]).join(" "), true);
        else say(d.message || "Something went wrong running the scan. Your answers are saved in the conversation form below.", true);
      })
      .catch(function () { say("We couldn't reach the scan. Your answers are saved in the conversation form below.", true); })
      .then(function () { submitBtn.disabled = false; submitBtn.removeAttribute("aria-busy"); if (window.turnstile) try { window.turnstile.reset("#scan-turnstile"); } catch (e) {} });
  }

  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (LIVE) { runLive(); return; }
    var a = scanAnswers();
    if (!a.length) { status.textContent = "Add at least one answer first, such as what keeps slipping."; status.style.color = "#B3541E"; form.elements.stuck.focus(); return; }
    safeStore("kernelScanAnswers", JSON.stringify(a));
    updateCarry();
    status.style.color = "";
    status.textContent = "Saved. Your answers are added to the conversation form at the bottom of this page. They have not been analyzed.";
  });

  function hideBrief() {
    var b = document.getElementById("brief"); b.hidden = true;
    var ss = document.getElementById("show-sample"); ss.setAttribute("aria-expanded", "false"); ss.textContent = "See the sample brief";
  }
  document.getElementById("show-sample").addEventListener("click", function () {
    var b = document.getElementById("brief");
    if (!b.hidden && brief && brief.sample) { hideBrief(); this.focus(); return; }
    showBrief(SAMPLE_BRIEF);
  });
  document.getElementById("close-brief").addEventListener("click", function () {
    hideBrief(); var ss = document.getElementById("show-sample");
    ss.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }); ss.focus({ preventScroll: true });
  });
  document.getElementById("more-toggle").addEventListener("click", function () {
    var rest = document.getElementById("brief-rest"), open = rest.hidden; rest.hidden = !open;
    this.setAttribute("aria-expanded", String(open)); this.classList.toggle("is-open", open);
    var n = this.dataset.n; this.querySelector(".exp-label").textContent = open ? "Hide the other " + (n === "1" ? "possibility" : n + " possibilities") : "Show " + n + " more " + (n === "1" ? "possibility" : "possibilities");
  });

  /* ---------- brief rendering ---------- */
  function rating(label, pair) {
    var w = el("span", null, label); var b = el("b", null, pair[0]); w.appendChild(b); return w;
  }
  function renderOpp(o) {
    state[o.id] = state[o.id] || { selected: false, status: "" };
    var card = el("article", "opp" + (o.top ? " top" : "")); card.id = "opp-" + o.id;
    var main = el("div", "opp-main");
    var left = el("div");
    var k = el("div", "opp-kicker");
    k.appendChild(el("span", null, o.category));
    if (o.top) k.appendChild(el("span", null, "· Strongest three"));
    var seenEv = {}; o.prompted.forEach(function (p) { if (seenEv[p[0]]) return; seenEv[p[0]] = 1; var t = EV[p[0]]; k.appendChild(el("span", "ev " + t[0], t[1])); });
    left.appendChild(k);
    var h = el("h6", null, o.title); h.id = "opp-t-" + o.id; left.appendChild(h);
    left.appendChild(el("p", "opp-why", o.why));
    main.appendChild(left);
    var r = el("div", "ratings"); r.appendChild(rating("Effort", o.effort)); r.appendChild(rating("Potential value", o.value)); main.appendChild(r);

    var c = el("div", "opp-controls");
    var sel = el("button", "tgl tgl-sel", "This resonates"); sel.type = "button"; sel.setAttribute("aria-pressed", "false"); sel.setAttribute("aria-describedby", h.id);
    var doing = el("button", "tgl", "Already doing this"); doing.type = "button"; doing.setAttribute("aria-pressed", "false"); doing.setAttribute("aria-describedby", h.id);
    var nr = el("button", "tgl", "Not relevant"); nr.type = "button"; nr.setAttribute("aria-pressed", "false"); nr.setAttribute("aria-describedby", h.id);
    var exp = el("button", "tgl tgl-exp"); exp.innerHTML = '<span class="exp-label">Show the thinking</span><svg class="chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'; exp.type = "button"; exp.setAttribute("aria-expanded", "false"); exp.setAttribute("aria-controls", "opp-d-" + o.id); exp.setAttribute("aria-describedby", h.id);
    [sel, doing, nr, exp].forEach(function (b) { c.appendChild(b); });
    main.appendChild(c);
    card.appendChild(main);

    var d = el("div", "opp-detail"); d.id = "opp-d-" + o.id; d.hidden = true;
    var p1 = el("div", "full"); p1.appendChild(el("span", "dh", "What prompted it"));
    var ul = el("ul"); o.prompted.forEach(function (p) { var li = el("li"); var t = EV[p[0]]; li.appendChild(el("span", "ev " + t[0], t[1])); li.appendChild(document.createTextNode(p[1])); ul.appendChild(li); }); p1.appendChild(ul); d.appendChild(p1);
    function block(title, text, full) { var b = el("div", full ? "full" : null); b.appendChild(el("span", "dh", title)); b.appendChild(el("p", null, text)); d.appendChild(b); }
    block("What Kernel could help build", o.build);
    block("A first experiment", o.experiment);
    block("Effort: " + o.effort[0], o.effort[1]);
    block("Potential value: " + o.value[0], o.value[1]);
    var v = el("div"); v.appendChild(el("span", "dh", "Still to validate")); var vu = el("ul"); o.validate.forEach(function (x) { vu.appendChild(el("li", null, x)); }); v.appendChild(vu); d.appendChild(v);
    var s = el("div"); s.appendChild(el("span", "dh", "Sources")); s.appendChild(el("p", "src", o.sources.length ? o.sources.join("; ") : "None. This one rests on the founder's answers and our hypothesis.")); d.appendChild(s);
    card.appendChild(d);

    exp.addEventListener("click", function () { var open = d.hidden; d.hidden = !open; exp.setAttribute("aria-expanded", String(open)); exp.querySelector(".exp-label").textContent = open ? "Hide the thinking" : "Show the thinking"; card.classList.toggle("is-open", open); });
    function sync() {
      var st = state[o.id];
      sel.setAttribute("aria-pressed", String(st.selected));
      doing.setAttribute("aria-pressed", String(st.status === "doing"));
      nr.setAttribute("aria-pressed", String(st.status === "irrelevant"));
      card.classList.toggle("is-selected", st.selected);
      card.classList.toggle("is-dim", !!st.status);
      updateCount();
    }
    sel.addEventListener("click", function () { var st = state[o.id]; st.selected = !st.selected; if (st.selected) st.status = ""; sync(); });
    doing.addEventListener("click", function () { var st = state[o.id]; st.status = st.status === "doing" ? "" : "doing"; if (st.status) st.selected = false; sync(); });
    nr.addEventListener("click", function () { var st = state[o.id]; st.status = st.status === "irrelevant" ? "" : "irrelevant"; if (st.status) st.selected = false; sync(); });
    return card;
  }

  function setHead(data, payload) {
    function put(id, html) { var n = document.getElementById(id); if (n) n.innerHTML = html; }
    if (data.sample) { Object.keys(sampleHead).forEach(function (id) { put(id, sampleHead[id]); }); return; }
    var esc = function (t) { var d = document.createElement("div"); d.textContent = t || ""; return d.innerHTML; };
    put("brief-tag", "Opportunity brief &middot; first draft to validate");
    put("brief-title", "Opportunity brief: " + esc(data.business));
    put("brief-intro", esc(data.summary) + (data.notes ? " <em>" + esc(data.notes) + "</em>" : "") + " This brief draws only on your answers, your public website, and public pages of other businesses.");
    var rows = [];
    if (payload) {
      if (payload.website) rows.push(["Website", payload.website]);
      if (payload.room) rows.push(["More room for", payload.room === "Other" ? payload.room_other || "Something else" : payload.room]);
      if (payload.stuck) rows.push(["Keeps slipping", payload.stuck]);
      if (payload.admire) rows.push(["Admires", payload.admire]);
    }
    put("brief-inputs", rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join(""));
    var n = data.opportunities.length;
    put("brief-close", n + (n === 1 ? " opportunity" : " opportunities") + ". A brief only lists what the evidence supports, so some will be shorter than others.");
  }

  function showBrief(data, payload) {
    brief = data;
    setHead(data, payload);
    var top = document.getElementById("brief-top"), rest = document.getElementById("brief-rest");
    top.innerHTML = ""; rest.innerHTML = "";
    var opps = data.opportunities.slice(0, 10);
    opps.filter(function (o) { return o.top; }).slice(0, 3).forEach(function (o) { top.appendChild(renderOpp(o)); });
    CATS.forEach(function (cat) {
      var list = opps.filter(function (o) { return !o.top && o.category === cat; });
      if (!list.length) return;
      var g = el("div", "cat-group"); g.appendChild(el("h5", null, cat));
      var l = el("div", "opp-list"); list.forEach(function (o) { l.appendChild(renderOpp(o)); }); g.appendChild(l); rest.appendChild(g);
    });
    var restCount = opps.filter(function (o) { return !o.top; }).length;
    var mb = document.getElementById("more-toggle");
    rest.hidden = true; mb.hidden = !restCount; mb.setAttribute("aria-expanded", "false");
    mb.dataset.n = restCount; mb.querySelector(".exp-label").textContent = "Show " + restCount + " more " + (restCount === 1 ? "possibility" : "possibilities");
    var b = document.getElementById("brief"); b.hidden = false; b.focus({ preventScroll: true });
    var ss = document.getElementById("show-sample"); ss.setAttribute("aria-expanded", "true"); ss.textContent = data.sample ? "Hide the sample brief" : "See the sample brief";
    b.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    updateCount();
  }

  function selectedOpps() { return brief ? brief.opportunities.filter(function (o) { return state[o.id] && state[o.id].selected; }) : []; }
  function updateCount() {
    var n = selectedOpps().length;
    document.getElementById("sel-count").textContent = n + " selected";
    document.getElementById("carry").setAttribute("aria-disabled", n ? "false" : "true");
  }

  /* ---------- carry into inquiry ---------- */
  var carryField = document.getElementById("carry-field"), carryBox = document.getElementById("inq-carry");
  function updateCarry() {
    var lines = [];
    var a = []; try { a = JSON.parse(safeStore("kernelScanAnswers") || "[]"); } catch (e) {}
    if (a.length) { lines.push("My answers (not yet analyzed):"); a.forEach(function (x) { lines.push("- " + x); }); }
    var sel = selectedOpps();
    if (sel.length) {
      if (lines.length) lines.push("");
      lines.push(brief && brief.sample ? "Ideas from the sample brief that resonated (sample for a fictional business):" : "Opportunities from my brief that resonated:");
      sel.forEach(function (o) { lines.push("- " + o.title + " [" + o.category + "]"); });
    }
    if (!lines.length) return false;
    carryBox.value = lines.join("\n");
    carryField.hidden = false;
    return true;
  }
  document.getElementById("carry").addEventListener("click", function () {
    if (!selectedOpps().length) { document.getElementById("sel-count").textContent = "Select at least one idea first"; return; }
    updateCarry();
    document.getElementById("inquiry").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    document.getElementById("inq-name").focus({ preventScroll: true });
  });
  updateCarry();

  /* ---------- keep a copy ---------- */
  function briefText() {
    if (!brief) return "";
    var out = ["KERNEL OPPORTUNITY SCAN", brief.sample ? "SAMPLE BRIEF: " + brief.business + ". Not an analysis of any real business." : brief.business, ""];
    brief.opportunities.forEach(function (o, i) {
      var st = state[o.id] || {};
      out.push((i + 1) + ". " + o.title + (o.top ? "  [strongest three]" : ""));
      out.push("   Category: " + o.category + (st.selected ? "  | You selected this" : "") + (st.status === "doing" ? "  | Already doing this" : "") + (st.status === "irrelevant" ? "  | Not relevant" : ""));
      o.prompted.forEach(function (p) { out.push("   " + EV[p[0]][1] + ": " + p[1]); });
      out.push("   Why it could matter: " + o.why, "   What Kernel could help build: " + o.build, "   First experiment: " + o.experiment);
      out.push("   Effort: " + o.effort[0] + " (" + o.effort[1] + ")", "   Potential value: " + o.value[0] + " (" + o.value[1] + ")");
      out.push("   Still to validate: " + o.validate.join("; "));
      if (o.sources.length) out.push("   Sources: " + o.sources.join("; "));
      out.push("");
    });
    out.push("kernel-collective.com");
    return out.join("\n");
  }
  document.getElementById("download-brief").addEventListener("click", function () {
    var blob = new Blob([briefText()], { type: "text/plain" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = brief && brief.sample ? "kernel-sample-opportunity-brief.txt" : "kernel-opportunity-brief.txt";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  document.getElementById("print-brief").addEventListener("click", function () {
    var closed = Array.prototype.slice.call(document.querySelectorAll(".opp-detail[hidden], #brief-rest[hidden]"));
    closed.forEach(function (d) { d.hidden = false; });
    window.print();
    closed.forEach(function (d) { d.hidden = true; });
  });

  /* ---------- honest send hint ---------- */
  if (typeof FORM_ENDPOINT !== "undefined" && FORM_ENDPOINT) {
    var hints = document.querySelectorAll(".inq > .field-hint");
    hints.forEach(function (h) { h.textContent = "We reply within 2 to 3 business days."; });
  }
})();

/* Example builds: accessible tabs */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('#examples [role=tab]'));
  if (!tabs.length) return;
  function select(t, focus) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      else if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (k === 'Home') n = tabs[0];
      else if (k === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); select(n, true); }
    });
  });
})();

/* ---------- Lab nav: show once the hero has scrolled away; mark the section in view ---------- */
(function () {
  var nav = document.getElementById("labnav"), hero = document.getElementById("intro");
  if (!nav || !hero) return;
  var ticking = false;
  function update() {
    ticking = false;
    var on = hero.getBoundingClientRect().bottom < 80;
    if (on !== nav.classList.contains("is-on")) {
      nav.classList.toggle("is-on", on);
      if (on) nav.removeAttribute("inert"); else nav.setAttribute("inert", "");
    }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();

  var links = {};
  nav.querySelectorAll("a.sec").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if (!("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var a = links[e.target.id]; if (!a) return;
      if (e.isIntersecting) {
        Object.keys(links).forEach(function (k) { links[k].classList.remove("is-here"); links[k].removeAttribute("aria-current"); });
        a.classList.add("is-here"); a.setAttribute("aria-current", "true");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
})();
