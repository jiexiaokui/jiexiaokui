(function () {
  'use strict';

  /* ── Scroll progress bar ── */
  var bar = document.getElementById('scroll-progress');
  if (bar) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY || document.documentElement.scrollTop;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (total > 0 ? Math.min(100, (scrolled / total) * 100) : 0) + '%';
    }, { passive: true });
  }

  /* ── Mobile nav toggle ── */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !siteNav.contains(e.target)) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Tab switching ── */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var btns = root.querySelectorAll('.tab-btn');
    var panels = root.querySelectorAll('.tab-panel');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var target = btn.getAttribute('data-tab');
        var panel = root.querySelector('[data-panel="' + target + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  });

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      var list = item.closest('.faq-list');
      if (list) list.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ── Animate counter ── */
  function animateCounter(el) {
    var target = Number(el.getAttribute('data-counter'));
    var unit = el.getAttribute('data-unit') || '';
    var duration = 1600;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * ease) + unit;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ── Animate progress fill ── */
  function animateProgress(el) {
    var w = el.getAttribute('data-width') || '0%';
    setTimeout(function () { el.style.width = w; }, 120);
  }

  /* ── IntersectionObserver for reveal + counters + progress ── */
  var done = new WeakSet();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || done.has(entry.target)) return;
        done.add(entry.target);
        var el = entry.target;
        el.classList.add('show');
        if (el.hasAttribute('data-counter')) animateCounter(el);
        if (el.classList.contains('prog-fill')) animateProgress(el);
        io.unobserve(el);
      });
    }, { threshold: 0.14 });
    document.querySelectorAll('.fade-in, [data-counter], .prog-fill').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('show'); });
    document.querySelectorAll('[data-counter]').forEach(function (el) {
      el.textContent = el.getAttribute('data-counter') + (el.getAttribute('data-unit') || '');
    });
    document.querySelectorAll('.prog-fill').forEach(function (el) {
      el.style.width = el.getAttribute('data-width') || '0%';
    });
  }

  /* ── Hero particle canvas ── */
  var canvas = document.getElementById('hero-canvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var pts = [];
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (var i = 0; i < 60; i++) {
      pts.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
        a: Math.random() * 0.5 + 0.12
      });
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var a = 0; a < pts.length; a++) {
        var p = pts[a];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(46,230,166,' + p.a + ')'; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        for (var b = a + 1; b < pts.length; b++) {
          var q = pts[b];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 88) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(46,168,255,' + (0.14 * (1 - d / 88)) + ')';
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

})();
