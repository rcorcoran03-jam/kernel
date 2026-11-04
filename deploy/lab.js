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
var SCAN_STEP_ENDPOINT = "/api/scan-step";
var TURNSTILE_SITE_KEY = "0x4AAAAAAFrykI24AUmOXZml";  // public Cloudflare Turnstile site key

var SAMPLE_BRIEF = {
 "version": 2,
 "sample": true,
 "business": "Juniper & Clay",
 "summary": "A two-person ceramics studio with classes, private parties, and a small online shop. The clearest wins are in how inquiries, bookings, and payments arrive, not in the making itself.",
 "notes": "",
 "opportunities": [
  {
   "id": "intake",
   "top": true,
   "category": "Programs & Workflows",
   "title": "One intake path for every class and party inquiry",
   "why": "Inquiries arrive in three places, so some go unanswered and the rest take time to track.",
   "prompted": [
    [
     "site",
     "The contact page offers email, an Instagram DM link, and a separate party form."
    ],
    [
     "told",
     "Class questions arrive by email and get lost between sessions."
    ]
   ],
   "build": "A single inquiry form that feeds one simple tracker, sends an instant reply, and reminds the studio to follow up.",
   "experiment": "For two weeks, point every contact link at one form and note reply times.",
   "value": [
    3,
    "Touches every new customer, and you named it directly."
   ],
   "complexity": [
    1,
    "Uses tools the studio already has."
   ],
   "tools": [
    [
     "Squarespace Forms",
     "have"
    ],
    [
     "Google Sheets",
     "have"
    ],
    [
     "Reply templates",
     "build"
    ]
   ],
   "needs": [
    "One channel chosen as official"
   ],
   "obstacles": [
    "Old links and DMs will keep arriving for a while"
   ],
   "sources": [],
   "validate": [
    "Inquiries per week",
    "Which channel customers prefer"
   ]
  },
  {
   "id": "choose",
   "top": true,
   "category": "Products & Offerings",
   "title": "Help visitors choose the right class before they email",
   "why": "The same questions repeat because the site doesn't answer them yet.",
   "prompted": [
    [
     "site",
     "Six class types are listed with no guidance on level or time."
    ],
    [
     "told",
     "You answer the same class questions again and again."
    ]
   ],
   "build": "A short comparison or quiz, written from real customer questions, that points each visitor to the right class.",
   "experiment": "Turn the five most-asked questions into a comparison table on the classes page.",
   "value": [
    3,
    "Cuts repeat email and could lift bookings."
   ],
   "complexity": [
    1,
    "Mostly writing and page structure."
   ],
   "tools": [
    [
     "Class guide page",
     "build"
    ],
    [
     "AI-drafted FAQ",
     "build"
    ]
   ],
   "needs": [
    "Your 20 most common questions"
   ],
   "obstacles": [
    "Class details change each season"
   ],
   "sources": [],
   "validate": [
    "Which questions come up most",
    "Where visitors drop off"
   ]
  },
  {
   "id": "deposit",
   "top": true,
   "category": "Programs & Workflows",
   "title": "Take party deposits at booking, not after",
   "why": "Chasing payments costs time and goodwill. A process fix first; no AI needed.",
   "prompted": [
    [
     "site",
     "The parties page says to email to book, with no deposit step."
    ],
    [
     "told",
     "Chasing party deposits is a recurring drain."
    ]
   ],
   "build": "A booking request with a deposit link and a confirmation template that spells out the policy.",
   "experiment": "Add a deposit link to the next five party confirmations.",
   "value": [
    2,
    "Saves follow-up and reduces late cancellations."
   ],
   "complexity": [
    1,
    "A payment link and a template."
   ],
   "tools": [
    [
     "Square",
     "add"
    ],
    [
     "Deposit policy",
     "write"
    ]
   ],
   "needs": [
    "A written deposit and cancellation policy"
   ],
   "obstacles": [
    "Regular customers may push back at first"
   ],
   "sources": [],
   "validate": [
    "Current payment tool",
    "Refund policy"
   ]
  },
  {
   "id": "connect",
   "top": false,
   "category": "Programs & Workflows",
   "title": "Connect registration, reminders, and class-day prep",
   "why": "Typing the same details in several places is where errors creep in.",
   "prompted": [
    [
     "hyp",
     "Registrations may be copied by hand into a roster and a materials list."
    ]
   ],
   "build": "Registration that fills the roster, sends reminders, and produces a prep checklist for each class.",
   "experiment": "Map one class from sign-up to clean-up and mark every place details are retyped.",
   "value": [
    2,
    "Fewer errors and less evening admin."
   ],
   "complexity": [
    2,
    "Depends on how the booking tool connects."
   ],
   "tools": [
    [
     "Acuity Scheduling",
     "add"
    ],
    [
     "Zapier",
     "add"
    ]
   ],
   "needs": [
    "One booking tool as the source of truth"
   ],
   "obstacles": [
    "Re-entry may not happen as often as it seems"
   ],
   "sources": [],
   "validate": [
    "Whether re-entry happens",
    "Which booking tool is in use"
   ]
  },
  {
   "id": "promo",
   "top": false,
   "category": "Products & Offerings",
   "title": "Plan the busy season as a promotion calendar",
   "why": "Planned promotions take less effort than last-minute ones and protect time for making.",
   "prompted": [
    [
     "peer",
     "Both studios you admire run a gift-card push every November."
    ],
    [
     "told",
     "You want more room for creative work."
    ]
   ],
   "build": "A twelve-month calendar with posts and emails drafted in the studio's own voice.",
   "experiment": "Plan the November to December gift-card push in one session.",
   "value": [
    2,
    "Depends on seasonal demand."
   ],
   "complexity": [
    1,
    "One planning session, then light upkeep."
   ],
   "tools": [
    [
     "Mailchimp",
     "add"
    ],
    [
     "AI drafts in your voice",
     "build"
    ]
   ],
   "needs": [
    "Last year's sales by month",
    "Product photos"
   ],
   "obstacles": [
    "Busy season leaves little time to plan"
   ],
   "sources": [],
   "validate": [
    "Sales by month",
    "Whether gift cards are offered"
   ]
  },
  {
   "id": "monday",
   "top": false,
   "category": "Admin & Operations",
   "title": "A Monday brief: deposits due, stock to reorder",
   "why": "Restocking and follow-ups slip when they live only in your head.",
   "prompted": [
    [
     "told",
     "Remembering to restock the shop keeps slipping."
    ],
    [
     "hyp",
     "Commitments are spread across inbox, bookings, and shop."
    ]
   ],
   "build": "A short weekly summary pulled from the inbox, bookings, and shop inventory.",
   "experiment": "Keep it by hand for four Mondays before automating.",
   "value": [
    2,
    "Fewer dropped balls; calmer weeks."
   ],
   "complexity": [
    3,
    "Needs access to three systems."
   ],
   "tools": [
    [
     "Gmail",
     "add"
    ],
    [
     "Square",
     "add"
    ],
    [
     "Google Sheets",
     "have"
    ]
   ],
   "needs": [
    "A simple stock list",
    "Access to each system"
   ],
   "obstacles": [
    "Two people share the inbox"
   ],
   "sources": [],
   "validate": [
    "Where the information lives",
    "What you check each week today"
   ]
  },
  {
   "id": "answers",
   "top": false,
   "category": "Admin & Operations",
   "title": "Turn repeat questions into a reusable answer library",
   "why": "Good answers written once work in email, on the site, and later for an assistant.",
   "prompted": [
    [
     "told",
     "The same class questions repeat."
    ]
   ],
   "build": "Saved replies and an FAQ page, in your own voice.",
   "experiment": "Collect the last twenty customer questions and group them.",
   "value": [
    2,
    "Overlaps with the class guide; best done together."
   ],
   "complexity": [
    1,
    "Pairs naturally with the class guide."
   ],
   "tools": [
    [
     "Gmail templates",
     "add"
    ],
    [
     "FAQ page",
     "build"
    ]
   ],
   "needs": [
    "Your 20 most common questions"
   ],
   "obstacles": [
    "Answers go stale if nobody owns them"
   ],
   "sources": [],
   "validate": [
    "Tone you want in replies"
   ]
  }
 ],
 "foundations": [
  {
   "item": "A written deposit and cancellation policy",
   "for": "deposits"
  },
  {
   "item": "Your 20 most common customer questions",
   "for": "class guide, answer library"
  },
  {
   "item": "One booking tool as the source of truth",
   "for": "registration, Monday brief"
  },
  {
   "item": "Product photos and a simple stock list",
   "for": "promotions, restocking"
  }
 ],
 "pitfalls": [
  "Switching every contact channel at once; move one, then the next.",
  "Automating reminders before the class process is written down.",
  "Letting AI send replies unreviewed in the first month.",
  "Planning promotions inside the busy season instead of before it."
 ],
 "inspiration": {
  "themes": [
   {
    "theme": "A reason to come back",
    "detail": "Both studios turn a first class into a habit with a pass or a series.",
    "peers": [
     "Kiln House",
     "Moss Street Pottery"
    ],
    "opportunity": "choose"
   },
   {
    "theme": "The season is planned",
    "detail": "Gift cards and holiday sales go to their email list first, weeks ahead.",
    "peers": [
     "Moss Street Pottery"
    ],
    "opportunity": "promo"
   },
   {
    "theme": "Choosing is easy",
    "detail": "Classes are grouped by level with clear time commitments.",
    "peers": [
     "Kiln House"
    ],
    "opportunity": "choose"
   }
  ],
  "profiles": [
   {
    "name": "Kiln House",
    "url": "",
    "origin": "named_by_founder",
    "moat": "A members' studio pass that gives regulars a reason to return every week.",
    "offers": [
     [
      "Wheel and hand-building classes",
      "seen"
     ],
     [
      "Open studio time",
      "seen"
     ]
    ],
    "programs": [
     [
      "Monthly membership",
      "seen"
     ],
     [
      "Six-week series",
      "seen"
     ]
    ],
    "strategy": [
     [
      "Community of regulars",
      "inferred"
     ]
    ],
    "sales_tools": [
     [
      "Intro-class bundle",
      "seen"
     ],
     [
      "Waitlist",
      "seen"
     ]
    ],
    "tech_stack": [
     [
      "Squarespace",
      "seen"
     ],
     [
      "Acuity Scheduling",
      "inferred"
     ]
    ],
    "borrow": "A simple returning-student offer after a first class.",
    "stand_apart": "Private parties; they don't offer them."
   },
   {
    "name": "Moss Street Pottery",
    "url": "",
    "origin": "named_by_founder",
    "moat": "A recognizable seasonal gift-card push, promoted to a loyal email list.",
    "offers": [
     [
      "Date-night classes",
      "seen"
     ],
     [
      "Shop of finished pieces",
      "seen"
     ]
    ],
    "programs": [
     [
      "Holiday workshops",
      "seen"
     ]
    ],
    "strategy": [
     [
      "Seasonal rhythm",
      "inferred"
     ]
    ],
    "sales_tools": [
     [
      "Gift cards",
      "seen"
     ],
     [
      "Email-first sales",
      "inferred"
     ]
    ],
    "tech_stack": [
     [
      "Shopify",
      "seen"
     ],
     [
      "Mailchimp",
      "inferred"
     ]
    ],
    "borrow": "Plan the gift-card season ahead, drafted in your voice.",
    "stand_apart": "Small classes and a two-person studio feel."
   }
  ]
 }
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
    if (bt) bt.innerHTML = "<strong>Your scan reads your public website and the businesses and category you name.</strong> It can&rsquo;t see how your business runs inside, so every point is labeled by where it came from, and anything we&rsquo;re guessing is labeled a hypothesis. <a href=\"#examples\">Review the examples below</a> to see what the scan can produce.";
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
    var site = document.getElementById("scan-site");
    siteField.classList.toggle("is-off", noSite.checked);
    site.disabled = noSite.checked;
    if (noSite.checked) { site.value = ""; document.getElementById("scan-describe").focus(); }
  });
  if (form) form.addEventListener("change", function (e) {
    if (e.target.name === "room") roomOther.hidden = e.target.value !== "Other";
  });

  function scanAnswers() {
    if (!form) return [];
    var f = form.elements, out = [];
    var site = f.website.value.trim();
    if (noSite.checked) out.push("No website yet");
    else if (site) out.push("Website: " + site);
    if (f.describe.value.trim()) out.push("In their words: " + f.describe.value.trim());
    var room = form.querySelector("input[name=room]:checked");
    if (room) out.push("More room for: " + (room.value === "Other" ? (f.room_other.value.trim() || "Something else") : room.value));
    if (f.stuck.value.trim()) out.push("Keeps slipping: " + f.stuck.value.trim());
    if (f.admire.value.trim()) out.push("Admires: " + f.admire.value.trim());
    if (f.operations.value.trim()) out.push("How it runs: " + f.operations.value.trim());
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
      stuck: f.stuck.value.trim(), admire: f.admire.value.trim(), operations: f.operations.value.trim(), tools: f.tools.value.trim(), team: f.team.value.trim(),
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
    var label = submitBtn.textContent; submitBtn.textContent = "Scanning\u2026";
    say("Your scan has started. This usually takes one to three minutes, so please keep this page open.");
    var prog = startProgress();
    var fail = "Your answers are saved in the conversation form below, so nothing is lost.";
    function done() { prog.stop(); submitBtn.textContent = label; submitBtn.disabled = false; submitBtn.removeAttribute("aria-busy"); if (window.turnstile) try { window.turnstile.reset("#scan-turnstile"); } catch (e) {} }
    function post(url, body) {
      return fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return { status: "error", retry: true, message: "The scan stopped before it finished (error " + r.status + "). " + fail }; }); });
    }
    function finish(d) {
      if (d.status === "ready" && d.brief) { prog.stage("done"); say("Your brief is ready below. Treat it as a first draft: check each point against what you know."); showBrief(d.brief, payload); }
      else if (d.status === "queued") { prog.stage("done"); say(d.message || "Your scan is done. It's with Kernel for a quick review, and we'll email your brief."); }
      else if (d.status === "invalid") say((d.errors || ["Please check the form."]).join(" "), true);
      else say(d.message || "Something went wrong running the scan. " + fail, true);
      done();
    }
    function step(job, tries) {
      prog.stage(job.next);
      post(SCAN_STEP_ENDPOINT, { id: job.id, key: job.key }).then(function (d) {
        if (d.status === "running") { if (d.next === job.next) { setTimeout(function () { step(job, tries); }, 4000); return; } job.next = d.next; step(job, 0); return; }
        if (d.status === "error" && d.retry && tries < 2) { setTimeout(function () { step(job, tries + 1); }, 2500); return; }
        finish(d);
      }).catch(function () {
        if (tries < 2) { setTimeout(function () { step(job, tries + 1); }, 3000); return; }
        say("We lost the connection while the scan was running. If your phone locked or the page closed, that can stop it. " + fail, true); done();
      });
    }
    post(SCAN_ENDPOINT, payload).then(function (d) {
      if (d.status === "started") step({ id: d.id, key: d.key, next: d.next }, 0);
      else finish(d);
    }).catch(function () { say("We couldn't reach the scan. " + fail, true); done(); });
  }

  function startProgress() {
    var box = document.getElementById("scan-progress"), time = document.getElementById("sp-time");
    if (!box) return { stop: function () {}, stage: function () {} };
    var steps = Array.prototype.slice.call(box.querySelectorAll(".sp-steps li"));
    var order = steps.map(function (li) { return li.dataset.stage; });
    var t0 = Date.now();
    box.hidden = false;
    box.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    function tick() { var s = Math.floor((Date.now() - t0) / 1000); time.textContent = Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
    tick(); var iv = setInterval(tick, 1000);
    return {
      stage: function (name) {
        var at = name === "done" ? order.length : order.indexOf(name);
        steps.forEach(function (li, i) { li.classList.toggle("is-done", i < at); li.classList.toggle("is-now", i === at); });
      },
      stop: function () { clearInterval(iv); setTimeout(function () { box.hidden = true; }, 1200); }
    };
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

  var showSample = document.getElementById("show-sample");
  if (showSample) showSample.addEventListener("click", function (e) {
    e.preventDefault();
    if (window.kernelExampleTab) window.kernelExampleTab("tab-sample");
    var ex = document.getElementById("examples");
    if (ex) ex.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });

  /* ---------- sample brief (Examples tab) and live brief: shared compact renderer ---------- */
  function renderSample() {
    var root = document.getElementById("sb-root");
    if (!root || !window.KernelBrief) return;
    window.KernelBrief.render(root, SAMPLE_BRIEF, {
      sample: true, idPrefix: "sb", cta: ["Run your own scan", "#scan-form"],
      input: { website: "juniperandclay.example (fictional)", room: "Creative work", stuck: "Answering the same class questions, chasing party deposits, remembering to restock the shop." }
    });
  }
  renderSample();

  function showBrief(data, payload) {
    brief = data; state = {};
    var root = document.getElementById("brief-root");
    window.KernelBrief.render(root, data, {
      input: payload || {}, selectable: true, idPrefix: "live", cta: ["Book the follow\u2011up call", "#inquiry"],
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      onSelect: function (o, on) { state[o.id] = { selected: on }; updateCount(); updateCarry(); }
    });
    var b = document.getElementById("brief"); b.hidden = false; b.focus({ preventScroll: true });
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
  document.getElementById("download-brief").addEventListener("click", function () {
    if (!brief) return;
    var blob = new Blob([window.KernelBrief.toText(brief)], { type: "text/plain" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "kernel-opportunity-brief.txt";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  document.getElementById("print-brief").addEventListener("click", function () {
    var closed = Array.prototype.slice.call(document.querySelectorAll("#brief .kb-item:not([open])"));
    closed.forEach(function (d) { d.open = true; });
    window.print();
    closed.forEach(function (d) { d.open = false; });
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
    var ex = document.getElementById('examples'); if (ex) ex.setAttribute('data-tab', t.id);
    if (focus) t.focus();
  }
  window.kernelExampleTab = function (id) { var t = document.getElementById(id); if (t) select(t); };
  select(tabs.filter(function (x) { return x.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
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

/* ---------- Selected work: case-study tabs + collapsible detail ---------- */
(function () {
  var sec = document.getElementById("work");
  if (!sec) return;
  var list = sec.querySelector(".work-tabs");
  var tabs = list ? Array.prototype.slice.call(list.querySelectorAll("[role=tab]")) : [];
  if (tabs.length) {
    list.hidden = false;
    document.documentElement.classList.add("js-work");
    function select(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t, p = document.getElementById(x.getAttribute("aria-controls"));
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        if (p) p.hidden = !on;
      });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var n = null, k = e.key;
        if (k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        else if (k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === "Home") n = tabs[0];
        else if (k === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    select(tabs[0]);
  }
  // detail is open on wide screens, collapsed on small ones
  var mq = window.matchMedia("(min-width: 861px)");
  var more = Array.prototype.slice.call(sec.querySelectorAll("details[data-desktop-open]"));
  function sync() { more.forEach(function (d) { d.open = mq.matches; }); }
  sync();
  if (mq.addEventListener) mq.addEventListener("change", sync); else if (mq.addListener) mq.addListener(sync);
})();

/* ---------- How we use AI: explanations open on wide screens, tucked away on phones ---------- */
(function () {
  var ds = Array.prototype.slice.call(document.querySelectorAll("#principles details[data-desktop-open]"));
  if (!ds.length) return;
  var mq = window.matchMedia("(min-width: 721px)");
  function sync() { ds.forEach(function (d) { d.open = mq.matches; }); }
  sync();
  if (mq.addEventListener) mq.addEventListener("change", sync); else if (mq.addListener) mq.addListener(sync);
})();
