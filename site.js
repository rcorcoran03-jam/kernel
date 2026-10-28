/* Kernel Collective site script
   ------------------------------------------------------------
   FORM_ENDPOINT: paste a Formspree (or similar) endpoint here to
   receive form submissions, e.g. "https://formspree.io/f/abcdwxyz".
   While it is empty, forms open the visitor's email app with their
   note prefilled to CONTACT_EMAIL, so no message is ever lost. */
var FORM_ENDPOINT = "";
var CONTACT_EMAIL = "hello@kernelcollaborative.com";

(function () {
  // ── Forms ──
  document.querySelectorAll("form.kernel-form").forEach(function (form) {
    var btn = form.querySelector("button[type=submit]");
    var status = form.querySelector(".form-status");
    var idle = btn ? btn.getAttribute("data-label") : "";
    function say(msg, ok) { if (status) { status.textContent = msg; status.style.color = ok ? "#7D8F78" : "#C0603A"; } }

    form.addEventListener("input", function (e) { e.target.classList.remove("is-invalid"); });
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var bad = Array.prototype.filter.call(form.elements, function (el) { return el.willValidate && !el.checkValidity(); });
      bad.forEach(function (el) { el.classList.add("is-invalid"); });
      if (bad.length) { say("Please complete the highlighted fields.", false); bad[0].focus(); return; }

      var data = new FormData(form);
      data.append("form", form.getAttribute("data-form") || "contact");

      if (!FORM_ENDPOINT) {
        var lines = [];
        data.forEach(function (v, k) { if (k !== "form" && k !== "message") lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ": " + v); });
        lines.push("", data.get("message") || "");
        var subject = form.getAttribute("data-form") === "core-inquiry" ? "Kernel Core inquiry" : "Starting a conversation";
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
        say("Opening your email app. If nothing opens, write to " + CONTACT_EMAIL + ".", true);
        return;
      }

      if (btn) { btn.disabled = true; btn.style.opacity = 0.6; btn.textContent = "Sending…"; }
      try {
        var res = await fetch(FORM_ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body: data });
        if (!res.ok) throw new Error("bad response");
        form.reset();
        if (btn) btn.textContent = "Sent ✓";
        say("Thank you — your note is with us. Expect a thoughtful reply within 2–3 business days.", true);
      } catch (err) {
        if (btn) btn.textContent = idle;
        say("Something went wrong sending that. Please email us directly at " + CONTACT_EMAIL + ".", false);
      } finally {
        if (btn) { btn.disabled = false; btn.style.opacity = 1; }
      }
    });
  });

  // ── Kernel Core inquiry toggle (Services page) ──
  var toggle = document.getElementById("inquiry-toggle");
  var panel = document.getElementById("core-inquiry");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) panel.removeAttribute("hidden"); else panel.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      var label = toggle.querySelector(".inq-label"); if (label) label.textContent = open ? "Close" : "Share the issue";
      var chev = toggle.querySelector(".inq-chev"); if (chev) chev.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
    });
    if (location.hash === "#core-inquiry") toggle.click();
  }

  // ── Scale the Kernel Cycle diagram to fit (Services page) ──
  function fitCycle() {
    var frame = document.getElementById("kernel-cycle-frame");
    var inner = document.getElementById("kernel-cycle");
    if (!frame || !inner) return;
    if (window.innerWidth <= 720) { inner.style.transform = ""; frame.style.height = ""; return; }
    var scale = Math.min(1, frame.clientWidth / 1100);
    inner.style.transform = "scale(" + scale + ")";
    frame.style.height = (860 * scale) + "px";
  }
  fitCycle();
  window.addEventListener("resize", fitCycle);
  window.addEventListener("load", fitCycle);
})();
