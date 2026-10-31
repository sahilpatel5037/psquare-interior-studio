/* P Square Interior Studio — launch countdown + gold dust + reveal (runs before the page paints).
   Settings live in config.js: LAUNCH_AT (null = "Launching soon" screen, no numbers) and LAUNCH_NOTE.
   Public countdown-only build (launch/). */
(function () {
  var root = document.documentElement;
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function Dust(canvas, opts) {
    if (!canvas || !canvas.getContext) return { stop: function () {} };
    opts = opts || {};
    var ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, parts = [], running = false, raf = 0, mouse = null;
    function spawn(any) {
      var big = Math.random() < 0.12;
      return { x: Math.random() * W, y: any ? Math.random() * H : H + 10, r: big ? 2 + Math.random() * 2.6 : 0.5 + Math.random() * 1.5,
        vy: 0.12 + Math.random() * 0.42, ph: Math.random() * 6.28, sp: 0.004 + Math.random() * 0.012, a: 0.25 + Math.random() * 0.6, big: big };
    }
    function size() {
      var r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(opts.max || 90, Math.round(W * H / (opts.density || 14000)));
      parts = []; for (var i = 0; i < n; i++) parts.push(spawn(true));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (running) { p.y -= p.vy; p.ph += p.sp; p.x += Math.sin(p.ph) * 0.25; if (p.y < -10) parts[i] = p = spawn(false); }
        var tw = 0.55 + 0.45 * Math.sin(p.ph * 3);
        var a = p.a * tw * Math.min(1, (H - Math.abs(p.y - H * 0.5) * 0.9) / H + 0.3);
        if (mouse) { var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy); if (d < 140) a = Math.min(1, a + (1 - d / 140) * 0.6); }
        if (p.big) {
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, "rgba(226,196,143," + (a * 0.55).toFixed(3) + ")"); g.addColorStop(1, "rgba(201,164,101,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 6.283); ctx.fill();
        } else {
          ctx.fillStyle = "rgba(226,196,143," + a.toFixed(3) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        }
      }
    }
    function loop() { draw(); if (running) raf = requestAnimationFrame(loop); }
    function start() { if (running || calm || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
    function pause() { running = false; cancelAnimationFrame(raf); }
    size(); draw();
    window.addEventListener("resize", function () { size(); if (!running) draw(); });
    document.addEventListener("visibilitychange", function () { document.hidden ? pause() : start(); });
    if (opts.mouseTarget && window.matchMedia("(pointer:fine)").matches) {
      opts.mouseTarget.addEventListener("pointermove", function (e) { var r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
      opts.mouseTarget.addEventListener("pointerleave", function () { mouse = null; });
    }
    start();
    return { stop: pause };
  }

  var C = window.PSQ_CONFIG || {};
  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = { get: function () { return null; }, has: function () { return false; } }; }
  var raw = C.LAUNCH_AT || null;
  var target = raw ? Date.parse(raw) : NaN;
  var soon = !raw || isNaN(target);                                // no date yet -> "Launching soon" screen
  if (!soon && Date.now() >= target) soon = true; // public countdown build: never blank

  root.classList.add("ln-on");
  window.PSQ_COUNTDOWN = true;
  function pad(n) { return n < 10 ? "0" + n : String(n); }

  document.addEventListener("DOMContentLoaded", function () {
    var el = document.getElementById("launch");
    if (!el) { root.classList.remove("ln-on"); return; }
    el.hidden = false;
    if (soon) el.classList.add("ln-soon");
    var noteEl = document.getElementById("ln-note");
    var note = C.LAUNCH_NOTE === undefined ? "Something beautiful is on its way. See you after Diwali." : C.LAUNCH_NOTE;
    if (noteEl && note) { noteEl.textContent = note; noteEl.hidden = false; }
    var dust = Dust(el.querySelector(".ln-dust"), { max: 110, density: 11000, mouseTarget: el });

    // v4: full-screen background film. Portrait screens get the 4:5 clip, wide screens the 16:9 one; reduced motion = poster only.
    var filmBox = el.querySelector(".ln-film"), film = filmBox && filmBox.querySelector("video"), filmWide = null;
    function playFilm() { if (!film || !film.src) return; try { var p = film.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    function setFilm() {
      if (!film) return;
      var wide = !(window.matchMedia && window.matchMedia("(max-aspect-ratio: 1/1)").matches);
      if (wide === filmWide) return; filmWide = wide;
      var poster = film.getAttribute(wide ? "data-poster-w" : "data-poster-p");
      if (poster) { filmBox.style.backgroundImage = "url(\"" + poster + "\")"; film.poster = poster; }
      if (calm) return;
      film.classList.remove("on");
      film.muted = true; film.defaultMuted = true; film.setAttribute("muted", ""); film.preload = "auto";
      film.src = film.getAttribute(wide ? "data-src-w" : "data-src-p"); film.load(); playFilm();
    }
    if (film) {
      film.addEventListener("playing", function () { film.classList.add("on"); });
      film.addEventListener("error", function () { film.classList.remove("on"); });
      setFilm();
      window.addEventListener("resize", setFilm);
      document.addEventListener("visibilitychange", function () { if (!document.hidden) playFilm(); });
      // iOS Low Power Mode can refuse autoplay: start on the first touch instead.
      el.addEventListener("touchstart", playFilm, { passive: true, once: true });
    }
    if (soon) return;                                                // no numbers, no reveal until a date is set

    var cells = {}; el.querySelectorAll(".ln-v").forEach(function (c) { cells[c.getAttribute("data-u")] = c; });
    var dateEl = document.getElementById("ln-date");
    try {
      dateEl.textContent = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
        .format(new Date(target)).replace(/\b(am|pm)\b/, function (m) { return m.toUpperCase(); }) + " IST";
    } catch (e) {}
    var done = false, timer = 0;
    function set(u, v) {
      var c = cells[u]; if (!c || c.textContent === v) return;
      c.textContent = v;
      if (!calm) { c.classList.remove("tick"); void c.offsetWidth; c.classList.add("tick"); }
    }
    function tick() {
      var left = Math.max(0, target - Date.now()), s = Math.floor(left / 1000);
      set("d", pad(Math.floor(s / 86400))); set("h", pad(Math.floor(s % 86400 / 3600)));
      set("m", pad(Math.floor(s % 3600 / 60))); set("s", pad(s % 60));
      if (left <= 0 && !done) { done = true; clearInterval(timer); open(); }
    }
    function open() {
      // zero: logo + tiles flare (1.1 s) -> film to full brightness with "NOW OPEN · P Square Interior Studio" (3.3 s)
      // -> curtains close with a gold seam (1.15 s) -> curtains open on the full site (1.7 s)
      el.classList.add("opening");
      setTimeout(function () {
        if (film && film.src) { try { film.currentTime = 0; } catch (e) {} playFilm(); }
        el.classList.add("play");
        setTimeout(function () {
          el.classList.add("close");
          setTimeout(function () {
            if (window.PSQ_LAUNCH_ONLY) { location.replace("/"); return; }
            el.classList.add("open"); root.classList.add("ln-reveal");
            if (film) { try { film.pause(); } catch (e) {} }
            setTimeout(function () {
              dust.stop(); window.removeEventListener("resize", setFilm);
              if (film) { film.removeAttribute("src"); try { film.load(); } catch (e) {} }
              el.remove(); root.classList.remove("ln-on", "ln-reveal");
              window.PSQ_COUNTDOWN = false;
              document.dispatchEvent(new CustomEvent("psq:launched"));
              window.dispatchEvent(new Event("resize"));
            }, calm ? 50 : 1700);
          }, calm ? 50 : 1150);
        }, calm ? 900 : 3300);
      }, calm ? 50 : 1100);
    }
    tick(); timer = setInterval(tick, 250);
  });
})();
