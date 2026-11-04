/* Kernel Opportunity Brief renderer (v2): one compact, branded layout used by the
   Lab sample, a live brief on the Lab page, and the private brief page.
   KernelBrief.render(root, brief, { input, sample, selectable, onSelect, cta, date }) */
(function () {
  var EV = { site: ["ev-site", "Website"], told: ["ev-told", "You told us"], peer: ["ev-peer", "Peer"], hyp: ["ev-hyp", "Hypothesis"] };
  var KIND = { have: "have", add: "add", build: "build", write: "write" };
  var SHORT = { "Products & Offerings": "Offerings", "Programs & Workflows": "Workflows", "Admin & Operations": "Admin" };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function dots(n, kind, label) {
    var w = el("span", "kb-dots kb-" + kind); w.setAttribute("role", "img"); w.setAttribute("aria-label", label + " " + n + " of 3");
    for (var i = 1; i <= 3; i++) w.appendChild(el("i", i <= n ? "on" : null)); return w;
  }
  function rates(o, withLabels) {
    var r = el("span", "kb-rates");
    var a = el("span", "kb-rate"); a.appendChild(dots(o.value[0], "v", "Value")); if (withLabels) a.appendChild(el("span", "kb-ml", "Value")); a.title = o.value[1];
    var b = el("span", "kb-rate"); b.appendChild(dots(o.complexity[0], "c", "Complexity")); if (withLabels) b.appendChild(el("span", "kb-ml", "Complexity")); b.title = o.complexity[1];
    r.appendChild(a); r.appendChild(b); return r;
  }
  function chips(list, max) {
    var w = el("span", "kb-chips");
    (list || []).slice(0, max || 4).forEach(function (t) { var c = el("span", "kb-chip", t[0]); if (t[1]) c.appendChild(el("em", null, KIND[t[1]] || t[1])); w.appendChild(c); });
    return w;
  }
  function evs(o) { var w = el("span", "kb-evs"), seen = {}; o.prompted.forEach(function (p) { if (seen[p[0]]) return; seen[p[0]] = 1; w.appendChild(el("span", "ev " + EV[p[0]][0], EV[p[0]][1])); }); return w; }
  function field(label, content) { var d = el("div", "kb-f"); d.appendChild(el("b", null, label)); if (typeof content === "string") d.appendChild(el("span", null, content)); else d.appendChild(content); return d; }
  function list(items) { var u = el("ul"); items.forEach(function (x) { u.appendChild(el("li", null, x)); }); return u; }

  function detail(o) {
    var d = el("div", "kb-detail");
    var pr = el("ul", "kb-pr"); o.prompted.forEach(function (p) { var li = el("li"); li.appendChild(el("span", "ev " + EV[p[0]][0], EV[p[0]][1])); li.appendChild(document.createTextNode(p[1])); pr.appendChild(li); });
    d.appendChild(field("What prompted it", pr));
    d.appendChild(field("What Kernel could build", o.build));
    d.appendChild(field("First experiment", o.experiment));
    d.appendChild(field("Value " + o.value[0] + "/3 · Complexity " + o.complexity[0] + "/3", o.value[1] + " " + o.complexity[1]));
    if (o.obstacles.length) d.appendChild(field("Obstacles", list(o.obstacles)));
    if (o.validate.length) d.appendChild(field("Still to validate", o.validate.join(" · ")));
    if (o.sources.length) { var s = el("span"); o.sources.forEach(function (u, i) { var a = el("a", null, u.replace(/^https?:\/\/(www\.)?/, "").slice(0, 48)); a.href = u; a.target = "_blank"; a.rel = "noopener"; if (i) s.appendChild(document.createTextNode(" · ")); s.appendChild(a); }); d.appendChild(field("Sources", s)); }
    return d;
  }

  function render(root, b, opts) {
    opts = opts || {};
    root.innerHTML = ""; root.classList.add("kb");
    var opps = (b.opportunities || []).slice(0, 10), top = opps.filter(function (o) { return o.top; }).slice(0, 3);
    var insp = b.inspiration || {}, profiles = insp.profiles || [], themes = insp.themes || [];
    var inp = opts.input || {};

    // header
    var hd = el("header", "kb-hd");
    var ht = el("div", "kb-hd-top");
    if (opts.wordmark !== false) { var img = el("img"); img.src = opts.wordmark || "assets/kernel-lab-wordmark-brass.svg"; img.alt = "Kernel Lab"; ht.appendChild(img); }
    ht.appendChild(el("span", "kb-m", opts.sample ? "Sample brief · fictional business" : "Opportunity brief · first draft to validate"));
    hd.appendChild(ht);
    var hm = el("div", "kb-hd-main"), hl = el("div");
    var h = el("h3", "kb-title", b.business); h.id = (opts.idPrefix || "kb") + "-title"; hl.appendChild(h);
    if (b.summary) hl.appendChild(el("p", "kb-sum", b.summary));
    if (b.notes && !opts.sample) hl.appendChild(el("p", "kb-notes", b.notes));
    hm.appendChild(hl);
    var rows = [];
    if (inp.website) rows.push(["Website", inp.website]);
    if (inp.room) rows.push(["More room for", inp.room === "Other" ? inp.room_other || "Something else" : inp.room]);
    if (inp.stuck) rows.push(["Keeps slipping", inp.stuck]);
    if (profiles.length) rows.push(["Compared with", profiles.map(function (p) { return p.name; }).join(", ")]);
    if (rows.length) { var dl = el("dl"); rows.forEach(function (r) { var dv = el("div"); dv.appendChild(el("dt", "kb-m", r[0])); dv.appendChild(el("dd", null, r[1])); dl.appendChild(dv); }); hm.appendChild(dl); }
    hd.appendChild(hm); root.appendChild(hd);

    var st = el("div", "kb-strip kb-m");
    [[opps.length, opps.length === 1 ? "opportunity" : "opportunities"], [top.length, "to start"], [profiles.length, profiles.length === 1 ? "business compared" : "businesses compared"]].forEach(function (x) { var s = el("span"); s.appendChild(el("b", null, String(x[0]))); s.appendChild(document.createTextNode(" " + x[1])); st.appendChild(s); });
    if (opts.date) st.appendChild(el("span", null, opts.date));
    root.appendChild(st);

    function section(title, note) { var s = el("section", "kb-s"); var sh = el("div", "kb-sh"); sh.appendChild(el("h4", null, title)); if (note) sh.appendChild(el("span", "kb-m", note)); s.appendChild(sh); root.appendChild(s); return s; }

    // a good place to start
    if (top.length) {
      var s1 = section("A good place to start", "Value ● · Complexity ●");
      var g = el("div", "kb-start");
      top.forEach(function (o) {
        var c = el("article", "kb-card");
        c.appendChild(el("span", "kb-m kb-cat", o.category));
        c.appendChild(el("h5", null, o.title));
        c.appendChild(el("p", null, o.why));
        c.appendChild(rates(o, true));
        if (o.tools.length) c.appendChild(chips(o.tools, 3));
        var ex = el("p", "kb-exp"); ex.appendChild(el("b", null, "First experiment ")); ex.appendChild(document.createTextNode(o.experiment)); c.appendChild(ex);
        g.appendChild(c);
      });
      s1.appendChild(g);
    }

    // all opportunities, condensed
    var s2 = section("All opportunities", "Open a row for the thinking");
    var head = el("div", "kb-row kb-row-h kb-m"); ["Opportunity", "Value", "Complexity", "Example tools", "Needs first"].forEach(function (t) { head.appendChild(el("span", null, t)); }); s2.appendChild(head);
    opps.forEach(function (o) {
      var row = el("details", "kb-item" + (o.top ? " is-top" : ""));
      var sm = el("summary", "kb-row");
      var t = el("span", "kb-t");
      if (opts.selectable) {
        var cb = el("input"); cb.type = "checkbox"; cb.className = "kb-sel"; cb.setAttribute("aria-label", "Interested in: " + o.title);
        cb.addEventListener("click", function (e) { e.stopPropagation(); if (opts.onSelect) opts.onSelect(o, cb.checked); });
        t.appendChild(cb);
      }
      var tt = el("span", "kb-tt"); tt.appendChild(el("span", "kb-tn", o.title));
      var meta = el("span", "kb-m kb-meta", (o.top ? "Start here · " : "") + (SHORT[o.category] || o.category)); tt.appendChild(meta); tt.appendChild(evs(o));
      t.appendChild(tt); sm.appendChild(t);
      var v = el("span", "kb-cv kb-cv-v"); v.appendChild(dots(o.value[0], "v", "Value")); sm.appendChild(v);
      var cx = el("span", "kb-cv kb-cv-c"); cx.appendChild(dots(o.complexity[0], "c", "Complexity")); sm.appendChild(cx);
      sm.appendChild(chips(o.tools, 3));
      sm.appendChild(el("span", "kb-needs", o.needs.join("; ") || "Nothing special"));
      row.appendChild(sm); row.appendChild(detail(o));
      s2.appendChild(row);
    });

    // inspiration
    if (profiles.length || themes.length) {
      var s3 = section("Inspiration from businesses you admire", "Publicly visible · inferred items marked");
      if (themes.length) {
        var th = el("ul", "kb-themes");
        themes.forEach(function (x) { var li = el("li"); li.appendChild(el("b", null, x.theme)); li.appendChild(document.createTextNode(" " + x.detail)); if (x.peers && x.peers.length) li.appendChild(el("span", "kb-m kb-who", x.peers.join(" · "))); th.appendChild(li); });
        s3.appendChild(th);
      }
      var pg = el("div", "kb-profiles");
      profiles.forEach(function (p) {
        var c = el("article", "kb-pf");
        var n = el("div", "kb-pf-n");
        if (p.url) { var a = el("a", null, p.name); a.href = p.url; a.target = "_blank"; a.rel = "noopener"; n.appendChild(a); } else n.appendChild(el("span", null, p.name));
        n.appendChild(el("span", "kb-m", p.origin === "found_by_search" ? "Found by search" : "You named"));
        c.appendChild(n);
        if (p.moat) { var m = el("p", "kb-moat"); m.appendChild(el("b", "kb-m", "Moat ")); m.appendChild(document.createTextNode(p.moat)); c.appendChild(m); }
        var dl2 = el("dl", "kb-pf-dl");
        [["Offers", p.offers], ["Programs", p.programs], ["Strategy", p.strategy], ["Sales tools", p.sales_tools], ["Tech stack", p.tech_stack]].forEach(function (r) {
          if (!r[1] || !r[1].length) return;
          var dv = el("div"); dv.appendChild(el("dt", "kb-m", r[0]));
          var dd = el("dd"); r[1].forEach(function (x) { var cc = el("span", "kb-chip" + (x[1] === "inferred" ? " is-inf" : ""), x[0]); if (x[1] === "inferred") cc.title = "Inferred from what's visible"; dd.appendChild(cc); });
          dv.appendChild(dd); dl2.appendChild(dv);
        });
        c.appendChild(dl2);
        if (p.borrow) c.appendChild(field("Borrow", p.borrow));
        if (p.stand_apart) c.appendChild(field("Stand apart", p.stand_apart));
        pg.appendChild(c);
      });
      s3.appendChild(pg);
    }

    // foundations + pitfalls
    var fnd = b.foundations || [], pit = b.pitfalls || [];
    if (fnd.length || pit.length) {
      var s4 = section("Before you build");
      var two = el("div", "kb-two");
      if (fnd.length) { var f = el("div", "kb-fnd"); f.appendChild(el("span", "kb-m kb-sub", "Put in place first")); var ul = el("ul"); fnd.forEach(function (x) { var li = el("li", null, x.item); if (x.for) li.appendChild(el("span", "kb-for", " · " + x.for)); ul.appendChild(li); }); f.appendChild(ul); two.appendChild(f); }
      if (pit.length) { var p2 = el("div", "kb-pit"); p2.appendChild(el("span", "kb-m kb-sub", "Watch for, if you go it alone")); p2.appendChild(list(pit)); two.appendChild(p2); }
      s4.appendChild(two);
    }

    var ft = el("footer", "kb-ft");
    ft.appendChild(el("p", null, opts.sample ? "A sample to show the shape of a brief. Run your own scan to get one for your business." : "A starting point, not a verdict. On the free follow‑up call we check each point against what you know and pick one to try."));
    if (opts.cta) { var ca = el("a", "kb-btn", opts.cta[0]); ca.href = opts.cta[1]; ft.appendChild(ca); }
    root.appendChild(ft);
    var fine = el("p", "kb-fine");
    fine.innerHTML = '<span class="ev ev-site">Website</span>seen on the public site <span class="ev ev-told">You told us</span>from your answers <span class="ev ev-peer">Peer</span>seen at a comparable business <span class="ev ev-hyp">Hypothesis</span>a guess to validate. Tool tags: <b>have</b> already in use, <b>add</b> a new tool, <b>build</b> made with Kernel, <b>write</b> an asset you create. Tools are examples to confirm, not endorsements. Dotted chips are inferred. No figures here estimate your results.';
    root.appendChild(fine);
  }

  /** Plain-text copy of a brief, for download. */
  function toText(b) {
    var out = ["KERNEL OPPORTUNITY BRIEF: " + b.business, b.summary || "", ""];
    b.opportunities.forEach(function (o, i) {
      out.push((i + 1) + ". " + o.title + (o.top ? "  [good place to start]" : ""), "   " + o.category + "  |  Value " + o.value[0] + "/3  Complexity " + o.complexity[0] + "/3");
      o.prompted.forEach(function (p) { out.push("   " + EV[p[0]][1] + ": " + p[1]); });
      out.push("   Build: " + o.build, "   First experiment: " + o.experiment);
      if (o.tools.length) out.push("   Tools: " + o.tools.map(function (t) { return t[0] + " (" + t[1] + ")"; }).join(", "));
      if (o.needs.length) out.push("   Needs first: " + o.needs.join("; "));
      if (o.obstacles.length) out.push("   Obstacles: " + o.obstacles.join("; "));
      out.push("");
    });
    (b.foundations || []).forEach(function (f, i) { if (!i) out.push("PUT IN PLACE FIRST"); out.push("- " + f.item + (f.for ? " (" + f.for + ")" : "")); });
    (b.pitfalls || []).forEach(function (p, i) { if (!i) out.push("", "WATCH FOR"); out.push("- " + p); });
    out.push("", "kernel-collective.com");
    return out.join("\n");
  }

  window.KernelBrief = { render: render, toText: toText };
})();
