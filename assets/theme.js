/* ==========================================================================
   buling 个人站 · 全站共用脚本
   原先每个页面各内联一份，且首页挂了 6 个独立 scroll 监听（每次滚动都强制
   回流 6 次）。这里合并成单个 rAF 调度，一处改动全站生效。
   所有模块都做了存在性判断，同一份脚本可直接用于所有页面。
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqCoarse = window.matchMedia('(pointer: coarse)');
  var reduceMotion = mqReduce.matches;

  /* ---------------------------------------------------------------- 加载遮罩
     原来绑定在 window.load 上：首页 hero 背景 8.9MB，load 事件可能十几秒才来，
     「加载中」会一直转。改为 DOMContentLoaded + 兜底超时。 */
  (function loading() {
    var el = $('#loading');
    if (!el) return;
    var hide = function () { el.classList.add('done'); };
    var schedule = function () { setTimeout(hide, 300); };
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', schedule, { once: true });
    } else {
      schedule();
    }
    window.addEventListener('load', hide, { once: true });
    setTimeout(hide, 3000); // 兜底：网络再差也不会卡住
  })();

  /* ------------------------------------------------------------------ 主题
     首屏的 data-theme 已在 <head> 内联脚本里抢先设置（避免白闪），
     这里只负责绑定切换按钮。 */
  (function theme() {
    var btn = $('#themeToggle');
    if (!btn) return;
    var icon = btn.querySelector('i');

    function paint(t) {
      root.setAttribute('data-theme', t);
      if (icon) icon.className = t === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', t === 'dark' ? '#0a0a0f' : '#fef6ff');
    }
    // 图标状态与 <head> 里已应用的属性对齐
    paint(root.getAttribute('data-theme') || 'dark');

    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      paint(next);
      try { localStorage.setItem('blog-theme', next); } catch (e) {}
    });
  })();

  /* ------------------------------------------------------------------ 导航 */
  (function nav() {
    var burger = $('#hamburger');
    var links = $('#navLinks');
    if (!burger || !links) return;

    function setOpen(open) {
      links.classList.toggle('open', open);
      burger.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
      burger.setAttribute('aria-expanded', String(open));
    }
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () { setOpen(!links.classList.contains('open')); });
    $$('a', links).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) setOpen(false);
    });
  })();

  /* ------------------------------------------------------------------ 粒子 */
  (function particles() {
    var host = $('#particles');
    if (!host || reduceMotion) return;
    var count = parseInt(host.dataset.particles || '12', 10);
    var colors = ['#e879b0', '#c084fc', '#f5a8d0', '#60a5fa', '#fbbf24', '#6ee7b7'];
    var frag = doc.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var p = doc.createElement('div');
      p.className = 'particle';
      var size = Math.random() * 4 + 2;
      p.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (Math.random() * 100).toFixed(2) + 'vw;' +
        'background:' + colors[(Math.random() * colors.length) | 0] + ';' +
        'animation-duration:' + (Math.random() * 14 + 10).toFixed(2) + 's;' +
        'animation-delay:' + (Math.random() * 12).toFixed(2) + 's';
      frag.appendChild(p);
    }
    host.appendChild(frag);
  })();

  /* ------------------------------------------------------- 滚动进场（IO） */
  (function reveal() {
    var items = $$('[data-anim]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* --------------------------------------------------------- 自定义光标
     改为 transform 定位（原来写 left/top，每次移动都触发回流），
     并且鼠标静止后停止 rAF，不再空转。 */
  (function cursor() {
    var dot = $('#cursorDot');
    var ring = $('#cursorRing');
    if (!dot || !ring || mqCoarse.matches || reduceMotion) return;

    var tx = 0, ty = 0, rx = 0, ry = 0, running = false, raf = 0;

    function frame() {
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      if (Math.abs(tx - rx) < 0.4 && Math.abs(ty - ry) < 0.4) {
        ring.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) translate(-50%,-50%)';
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    doc.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0) translate(-50%,-50%)';
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }, { passive: true });

    $$('a,button,.proj-card,.gal-item,.soc-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
    });

    window.addEventListener('pagehide', function () { cancelAnimationFrame(raf); });
  })();

  /* ------------------------------------------------------- 滚动主循环
     进度条 / 收起导航 / 回到顶部 / 视差 / 当前区块高亮，全部合并在一个
     rAF 里执行，读写分离，滚动时只回流一次。 */
  (function scrollEngine() {
    var bar = $('#scrollProgress');
    var navbar = $('#navbar');
    var btt = $('#btt');
    var parallaxEls = $$('[data-parallax]');
    var sections = $$('section[id]');
    var navAnchors = $$('.nav-links a');

    var lastY = window.scrollY || 0;
    var ticking = false;
    var offsets = [];

    function measure() {
      offsets = sections.map(function (s) { return { id: s.id, top: s.offsetTop }; });
    }
    measure();
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('load', measure);

    function updateParallax() {
      if (reduceMotion) return;
      var vh = window.innerHeight;
      for (var i = 0; i < parallaxEls.length; i++) {
        var el = parallaxEls[i];
        var host = el.parentElement || el;
        var r = host.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) continue;
        if (el.dataset.parallax === 'hero') {
          var y = -r.top;
          el.style.transform = 'scale(1.15) translate3d(0,' + (y * 0.25).toFixed(1) + 'px,0)';
          el.style.opacity = Math.max(0, 1 - y / (vh * 0.8)).toFixed(3);
        } else {
          el.style.transform = 'scale(1.15) translate3d(0,' + ((r.top / vh) * 50).toFixed(1) + 'px,0)';
        }
      }
    }

    function update() {
      ticking = false;
      var y = window.scrollY;

      if (bar) {
        var max = doc.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      }
      if (navbar) navbar.classList.toggle('hide', y > lastY && y > 80);
      if (btt) btt.classList.toggle('show', y > 500);

      updateParallax();

      if (offsets.length && navAnchors.length) {
        var cur = '';
        for (var i = 0; i < offsets.length; i++) {
          if (y >= offsets[i].top - 200) cur = offsets[i].id;
        }
        for (var j = 0; j < navAnchors.length; j++) {
          var href = navAnchors[j].getAttribute('href') || '';
          navAnchors[j].classList.toggle('active', href === '#' + cur && href !== '#');
        }
      }
      lastY = y;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btt) {
      btt.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ------------------------------------------------------------ 灯箱 */
  (function lightbox() {
    var lb = $('#lightbox');
    if (!lb) return;
    var img = $('#lbImg');
    var counter = $('#lbCount');
    var prev = $('#lbPrev');
    var next = $('#lbNext');
    var closeBtn = $('#lbClose');
    var items = $$('.gal-item');
    var srcs = items.map(function (it) {
      var im = it.querySelector('img');
      return im ? (im.currentSrc || im.src) : '';
    }).filter(Boolean);
    if (!srcs.length) return;

    var index = 0;
    var lastFocus = null;

    function render() {
      img.src = srcs[index];
      img.alt = '第 ' + (index + 1) + ' 张图片，共 ' + srcs.length + ' 张';
      if (counter) counter.textContent = (index + 1) + ' / ' + srcs.length;
    }
    function open(i) {
      index = i;
      lastFocus = doc.activeElement;
      render();
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      doc.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      doc.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function step(delta) {
      index = (index + delta + srcs.length) % srcs.length;
      render();
    }

    items.forEach(function (it, i) {
      it.setAttribute('role', 'button');
      it.setAttribute('tabindex', '0');
      it.setAttribute('aria-label', '查看第 ' + (i + 1) + ' 张图片');
      it.addEventListener('click', function () { open(i); });
      it.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

    doc.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'Tab') {
        // 焦点锁在灯箱内
        var focusables = [closeBtn, prev, next].filter(Boolean);
        var i = focusables.indexOf(doc.activeElement);
        if (i === -1) return;
        e.preventDefault();
        focusables[(i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
      }
    });

    // 触摸滑动
    var startX = 0;
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
    }, { passive: true });
  })();
})();
