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
var SCAN_ENDPOINT = "";       // "" = sample only. "/api/scan" = live.
var TURNSTILE_SITE_KEY = "";  // public Cloudflare Turnstile site key

var SAMPLE_BRIEF = {
  sample: true,
  business: "Juniper & Clay (fictional)",
  opportunities: [
    {
      id: "intake", top: true, category: "Programs & Workflows",
      title: "Turn class and party inquiries into one intake and follow-up path",
      why: "Inquiries are the start of every sale. When they arrive in three places, some go unanswered and the rest cost time to track.",
      prompted: [
        ["site", "The contact page offers email, an Instagram DM link, and a separate party form."],
        ["told", "Class questions arrive by email and get lost between sessions."]
      ],
      build: "A single inquiry form that feeds one simple tracker, sends an immediate acknowledgment, and reminds the studio to follow up.",
      experiment: "For two weeks, point every contact link at one form and note how long replies take.",
      effort: ["Low to medium", "Uses tools a studio like this usually already has."],
      value: ["High", "Touches every new customer, and the founder named it directly."],
      sources: ["Sample site: juniperandclay.example/contact (fictional)"],
      validate: ["How many inquiries arrive each week", "Which channel customers actually prefer"]
    },
    {
      id: "choose", top: true, category: "Products & Offerings",
      title: "Help visitors choose the right class before they email",
      why: "If the same questions repeat, the site is not yet answering them. A clear comparison can turn a question into a booking.",
      prompted: [
        ["site", "The classes page lists six class types with no guidance on level, time commitment, or who each suits."],
        ["told", "The founder answers the same class questions again and again."]
      ],
      build: "A short guide or quiz, written from real customer questions, that points each visitor to the class that fits.",
      experiment: "Turn the five most-asked questions into a comparison table on the classes page.",
      effort: ["Low", "Mostly writing and page structure; no new tools required."],
      value: ["High", "Reduces repeat email and could lift bookings."],
      sources: ["Sample site: juniperandclay.example/classes (fictional)"],
      validate: ["Which questions come up most often", "Whether visitors drop off on the classes page"]
    },
    {
      id: "deposit", top: true, category: "Programs & Workflows",
      title: "Collect party deposits when the booking is made, not after",
      why: "Chasing payments is time and goodwill spent on the least creative part of the job. This is a process fix first; no AI required.",
      prompted: [
        ["site", "The private parties page says to email to book, with no deposit step."],
        ["told", "Chasing party deposits is a recurring drain."]
      ],
      build: "A booking request that includes a deposit link and a confirmation template with the policy spelled out.",
      experiment: "Add a deposit link to the next five party confirmations and compare how quickly they are paid.",
      effort: ["Low", "A payment link and a template."],
      value: ["Medium to high", "Saves follow-up time and reduces late cancellations."],
      sources: ["Sample site: juniperandclay.example/parties (fictional)"],
      validate: ["Current payment tool", "Cancellation and refund policy"]
    },
    {
      id: "connect", category: "Programs & Workflows",
      title: "Connect registration, reminders, and class-day prep",
      why: "Entering the same details in several places is where errors creep in.",
      prompted: [
        ["hyp", "Registrations may be copied by hand into a roster and a materials list."]
      ],
      build: "Registration that feeds the roster automatically, sends reminders, and produces a prep checklist for each class.",
      experiment: "Map one class from sign-up to clean-up and mark every place information is typed twice.",
      effort: ["Medium", "Depends on how the current booking tool connects."],
      value: ["Medium", "Fewer errors and less evening admin."],
      sources: [],
      validate: ["Whether re-entry actually happens", "Which booking tool is in use"]
    },
    {
      id: "promo", category: "Products & Offerings",
      title: "Plan the busy season as a promotion calendar",
      why: "Planned promotions take less effort than last-minute ones and protect time for making.",
      prompted: [
        ["site", "Both admired studios run seasonal gift-card promotions."],
        ["told", "The founder wants more room for creative work."],
        ["hyp", "Promotions here may currently be ad hoc."]
      ],
      build: "A twelve-month promotion calendar with drafted posts and emails in the studio's own voice.",
      experiment: "In one session, plan the November to December gift-card push end to end.",
      effort: ["Low to medium", "One planning session, then light upkeep."],
      value: ["Medium", "Depends on seasonal demand."],
      sources: ["Sample admired studios (fictional)"],
      validate: ["Sales by month last year", "Whether gift cards are already offered"]
    },
    {
      id: "brief", category: "Admin & Operations",
      title: "A Monday brief of commitments, deposits due, and stock to reorder",
      why: "Restocking and follow-ups slip when they live only in the founder's head.",
      prompted: [
        ["told", "Remembering to restock the shop keeps slipping."],
        ["hyp", "Commitments are spread across inbox, booking tool, and shop."]
      ],
      build: "A short weekly brief assembled from the inbox, bookings, and shop inventory, listing decisions, commitments, and neglected follow-ups.",
      experiment: "Keep the brief by hand for four Mondays to learn what belongs in it before automating.",
      effort: ["Medium", "Needs access to three systems."],
      value: ["Medium", "Fewer dropped balls; calmer weeks."],
      sources: [],
      validate: ["Which systems hold the information", "What the founder checks each week today"]
    },
    {
      id: "answers", category: "Admin & Operations",
      title: "Turn recurring customer questions into a reusable answer library",
      why: "Good answers written once can be reused in email, on the site, and later by an assistant.",
      prompted: [
        ["told", "The same class questions repeat."]
      ],
      build: "A saved-reply library and an FAQ page, which could later train a simple assistant on the studio's own material.",
      experiment: "Collect the last twenty customer questions and group them into themes.",
      effort: ["Low", "Pairs naturally with the class guide above."],
      value: ["Medium", "Overlaps with helping visitors choose; best done together."],
      sources: [],
      validate: ["Overlap with the class guide", "Tone the founder wants in replies"]
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

  document.getElementById("show-sample").addEventListener("click", function () { showBrief(SAMPLE_BRIEF); });

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
    o.prompted.forEach(function (p) { var t = EV[p[0]]; k.appendChild(el("span", "ev " + t[0], t[1])); });
    left.appendChild(k);
    var h = el("h6", null, o.title); h.id = "opp-t-" + o.id; left.appendChild(h);
    left.appendChild(el("p", "opp-why", o.why));
    main.appendChild(left);
    var r = el("div", "ratings"); r.appendChild(rating("Effort", o.effort)); r.appendChild(rating("Potential value", o.value)); main.appendChild(r);

    var c = el("div", "opp-controls");
    var sel = el("button", "tgl tgl-sel", "This resonates"); sel.type = "button"; sel.setAttribute("aria-pressed", "false"); sel.setAttribute("aria-describedby", h.id);
    var doing = el("button", "tgl", "Already doing this"); doing.type = "button"; doing.setAttribute("aria-pressed", "false"); doing.setAttribute("aria-describedby", h.id);
    var nr = el("button", "tgl", "Not relevant"); nr.type = "button"; nr.setAttribute("aria-pressed", "false"); nr.setAttribute("aria-describedby", h.id);
    var exp = el("button", "tgl tgl-exp", "Show the thinking"); exp.type = "button"; exp.setAttribute("aria-expanded", "false"); exp.setAttribute("aria-controls", "opp-d-" + o.id); exp.setAttribute("aria-describedby", h.id);
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

    exp.addEventListener("click", function () { var open = d.hidden; d.hidden = !open; exp.setAttribute("aria-expanded", String(open)); exp.textContent = open ? "Hide the thinking" : "Show the thinking"; });
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
    var closed = Array.prototype.slice.call(document.querySelectorAll(".opp-detail[hidden]"));
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
