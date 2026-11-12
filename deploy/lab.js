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
 "summary": "A two-person ceramics studio with classes, private parties and a small online shop. The clearest wins are in how customers arrive, book and pay, and in one place to see the week, not in the making itself.",
 "notes": "",
 "opportunities": [
  {
   "id": "intake",
   "top": true,
   "category": "Programs & Workflows",
   "title": "One front door, one record for every customer",
   "why": "Class questions, party requests and shop messages arrive in three places, so replies slip and no one sees the full history.",
   "prompted": [
    [
     "site",
     "The contact page offers email, an Instagram DM link and a separate party form."
    ],
    [
     "told",
     "Class questions arrive by email and get lost between sessions."
    ]
   ],
   "build": "One inquiry form for classes, parties and commissions that creates a customer record, sends an instant reply and lands on a simple board: new, replied, booked.",
   "experiment": "For two weeks, point every contact link at one form and track how long replies take.",
   "value": [
    3,
    "Touches every new customer, and you named it directly."
   ],
   "complexity": [
    2,
    "A small build on tools you already use."
   ],
   "tools": [
    [
     "Squarespace Forms",
     "have"
    ],
    [
     "Customer record",
     "build"
    ],
    [
     "Reply templates",
     "write"
    ]
   ],
   "needs": [
    "One channel chosen as official"
   ],
   "obstacles": [
    "Old links and DMs keep arriving for a while"
   ],
   "sources": [],
   "validate": [
    "Inquiries per week",
    "Time to first reply"
   ]
  },
  {
   "id": "pay",
   "top": true,
   "category": "Programs & Workflows",
   "title": "Book and pay in one step, deposits included",
   "why": "Chasing party deposits costs time and goodwill. The fix starts with a clear policy, not AI.",
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
   "build": "Booking that takes a deposit or full payment at the moment someone books, applies your own discounts, and keeps every payment, refund and balance in one ledger.",
   "experiment": "Send a deposit link with the next five party bookings and see how many confirm without a reminder.",
   "value": [
    3,
    "Money arrives sooner and no one has to ask."
   ],
   "complexity": [
    2,
    "Payment setup plus a written policy."
   ],
   "tools": [
    [
     "Square",
     "have"
    ],
    [
     "Online checkout",
     "add"
    ],
    [
     "Deposit and refund policy",
     "write"
    ]
   ],
   "needs": [
    "A written deposit and cancellation policy"
   ],
   "obstacles": [
    "Some regulars will still want to pay in person"
   ],
   "sources": [],
   "validate": [
    "Days from booking to deposit",
    "Late cancellations"
   ]
  },
  {
   "id": "today",
   "top": true,
   "category": "Admin & Operations",
   "title": "A Today view: who needs a reply, what's due, what's running low",
   "why": "The week lives in memory: deposits outstanding, class rosters, clay and glaze running low.",
   "prompted": [
    [
     "told",
     "Remembering to restock the shop slips during busy weeks."
    ],
    [
     "hyp",
     "With inquiries and payments in one record, the daily list can assemble itself."
    ]
   ],
   "build": "One screen each morning with unanswered inquiries, balances due, this week's rosters and stock below a level you set. You work down it; nothing goes out without you.",
   "experiment": "For two weeks, write the list by hand each Monday and note what you wish it had caught.",
   "value": [
    3,
    "Fewer dropped balls and more headspace."
   ],
   "complexity": [
    2,
    "Builds on the customer record above."
   ],
   "tools": [
    [
     "Today view",
     "build"
    ],
    [
     "Google Sheets",
     "have"
    ]
   ],
   "needs": [
    "Inquiries and payments in one place first"
   ],
   "obstacles": [
    "Only as good as the records behind it"
   ],
   "sources": [],
   "validate": [
    "Missed follow-ups per week"
   ]
  },
  {
   "id": "choose",
   "top": false,
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
   "build": "A short class guide, written from real customer questions, that points each visitor to the right class and answers the rest up front.",
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
     "Answers from real questions",
     "write"
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
    "Which questions come up most"
   ]
  },
  {
   "id": "forms",
   "top": false,
   "category": "Programs & Workflows",
   "title": "Forms and waivers signed once and kept on file",
   "why": "Clay, kilns and kids' parties usually call for signed waivers, and paper copies are hard to find later.",
   "prompted": [
    [
     "hyp",
     "Private parties likely need a signed waiver from each guest's adult."
    ]
   ],
   "build": "Online forms with e-signature, attached to each booking, with a reminder for anything still unsigned. The exact text signed is saved with the date.",
   "experiment": "Move the current waiver to an online form for one month of parties.",
   "value": [
    2,
    "Less paper and a clear record if something happens."
   ],
   "complexity": [
    1,
    "Simple setup once the waiver text is final."
   ],
   "tools": [
    [
     "E-signature forms",
     "add"
    ],
    [
     "Waiver text",
     "write"
    ]
   ],
   "needs": [
    "Final waiver text, ideally reviewed"
   ],
   "obstacles": [
    "Walk-in guests who skip the form"
   ],
   "sources": [],
   "validate": [
    "Unsigned forms on party day"
   ]
  },
  {
   "id": "sources",
   "top": false,
   "category": "Products & Offerings",
   "title": "Know which posts, flyers and partners fill classes",
   "why": "Promotion happens on Instagram, flyers and the newsletter, with no way to see which one leads to a booking.",
   "prompted": [
    [
     "site",
     "Instagram and a newsletter signup are linked from every page."
    ],
    [
     "hyp",
     "No booking form asks how people heard about the studio."
    ]
   ],
   "build": "Tagged links and QR codes per channel, plus a 'how did you hear about us' question, feeding the customer record and a simple monthly report.",
   "experiment": "Add the question to the booking form for one month and tally the answers.",
   "value": [
    2,
    "Puts promotion time where it pays off."
   ],
   "complexity": [
    1,
    "Small changes to forms and links."
   ],
   "tools": [
    [
     "Tagged links and QR codes",
     "build"
    ],
    [
     "Newsletter tool",
     "have"
    ]
   ],
   "needs": [
    "A short list of channels you actually use"
   ],
   "obstacles": [
    "People forget where they first heard"
   ],
   "sources": [],
   "validate": [
    "Bookings by channel"
   ]
  },
  {
   "id": "shop",
   "top": false,
   "category": "Admin & Operations",
   "title": "Connect the shop so sales and stock sit with everything else",
   "why": "Shop sales and class bookings live in separate systems, so customer history and restocking are guesswork.",
   "prompted": [
    [
     "site",
     "The online shop runs separately from class booking."
    ],
    [
     "told",
     "Remembering to restock the shop slips during busy weeks."
    ]
   ],
   "build": "Connect the existing shop to the studio record so purchases join each customer's history and low stock shows up on the Today view. The shop keeps handling checkout.",
   "experiment": "Export last quarter's shop orders and match them to class customers by email.",
   "value": [
    2,
    "Shows who your regulars really are."
   ],
   "complexity": [
    2,
    "Depends on what the shop can export or connect."
   ],
   "tools": [
    [
     "Shop platform",
     "have"
    ],
    [
     "Shop connection",
     "build"
    ]
   ],
   "needs": [
    "One booking tool as the source of truth"
   ],
   "obstacles": [
    "Customers using different emails in each place"
   ],
   "sources": [],
   "validate": [
    "Repeat customers across shop and classes"
   ]
  },
  {
   "id": "playbook",
   "top": false,
   "category": "Admin & Operations",
   "title": "A studio playbook a new helper can learn in an afternoon",
   "why": "Class-day setup and party hosting live in the founders' heads, which makes it hard to bring on help.",
   "prompted": [
    [
     "hyp",
     "A two-person studio taking more parties will need helpers who can run setup alone."
    ]
   ],
   "build": "Short how-to guides and screen walkthroughs for class-day setup, party hosting and the studio tools, written as each piece is built.",
   "experiment": "Record one class-day setup on your phone and turn it into a one-page checklist.",
   "value": [
    2,
    "Makes it possible to step away."
   ],
   "complexity": [
    1,
    "Writing and short recordings."
   ],
   "tools": [
    [
     "Playbook",
     "write"
    ],
    [
     "Walkthrough videos",
     "build"
    ]
   ],
   "needs": [
    "An hour of your time per guide"
   ],
   "obstacles": [
    "Guides go stale if no one owns them"
   ],
   "sources": [],
   "validate": [
    "Questions from new helpers"
   ]
  }
 ],
 "foundations": [
  {
   "item": "A written deposit and cancellation policy",
   "for": "booking and payment"
  },
  {
   "item": "Your 20 most common customer questions",
   "for": "class guide"
  },
  {
   "item": "One booking tool as the source of truth",
   "for": "customer record, Today view"
  },
  {
   "item": "A simple stock list with reorder levels",
   "for": "Today view, shop"
  }
 ],
 "pitfalls": [
  "Switching every contact channel at once; move one, then the next.",
  "Connecting the shop before the customer record is settled.",
  "Letting AI send replies unreviewed in the first month.",
  "Automating reminders before the class process is written down."
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
    "opportunity": "sources"
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

  function admireValue() {
    if (!form) return "";
    var f = form.elements;
    return [f.admire.value.trim(), f.admire2 ? f.admire2.value.trim() : ""].filter(Boolean).join("\n");
  }

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
    var adm = admireValue(); if (adm) out.push("Admires: " + adm.replace(/\n/g, "; "));
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
      stuck: f.stuck.value.trim(), admire: admireValue(), operations: f.operations.value.trim(), tools: f.tools.value.trim(), team: f.team.value.trim(),
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
    say("Your scan has started. This usually takes two to four minutes, so please keep this page open.");
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
      sample: true, idPrefix: "sb", cta: ["Run your own scan", "#scan-form"], more: ["See the full sample brief", "5 more ideas \u00b7 peers \u00b7 before you build"],
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
  var nextBar = null;
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
      if (nextBar) paintNext(t);
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
    // A "next case" bar under the open case, so someone scrolling through one case finds the other.
    nextBar = document.createElement("button");
    nextBar.type = "button"; nextBar.className = "work-next";
    var lastPanel = document.getElementById(tabs[tabs.length - 1].getAttribute("aria-controls"));
    if (lastPanel) lastPanel.parentNode.insertBefore(nextBar, lastPanel.nextSibling);
    function paintNext(cur) {
      var i = tabs.indexOf(cur), nx = tabs[(i + 1) % tabs.length];
      var name = nx.querySelector(".wt-name"), kind = nx.querySelector(".wt-kind"), num = nx.querySelector(".wt-num");
      nextBar.innerHTML = '<span class="wn-k">' + (i + 1 < tabs.length ? "Next case" : "Back to") + '</span><span class="wn-n">' + (num ? num.textContent + " &middot; " : "") + (name ? name.textContent : "") + '</span>' + (kind ? '<span class="wn-d">' + kind.textContent + '</span>' : "") + '<span class="wn-a" aria-hidden="true">&rarr;</span>';
      nextBar.onclick = function () { select(nx); list.scrollIntoView({ behavior: "smooth", block: "start" }); };
    }
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
