/* Kernel Suite page script
   Suite nav: show once the hero has scrolled away; mark the section in view.
   Same behaviour as the Lab nav in lab.js. */
(function () {
  var nav = document.getElementById("suitenav"), hero = document.getElementById("intro");
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
