
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  var here = location.pathname.replace(/index\.html$/, '');
  var inServices = false;
  document.querySelectorAll('.header a[href], .mnav a[href]').forEach(function (a) {
    if (a.hostname !== location.hostname || a.hasAttribute('hreflang')) return;
    var p = a.pathname.replace(/index\.html$/, '');
    if (p === here && !a.classList.contains('logo') && !a.closest('.mega__foot')) {
      a.setAttribute('aria-current', 'page');
      if (a.closest('.mega__grid')) inServices = true;
    }
  });
  var svcBtn = document.querySelector('.nav__item--dd > .nav__a');
  if (svcBtn && inServices) svcBtn.setAttribute('aria-current', 'true');
  
  var dd = document.querySelector('.nav__item--dd');
  if (dd) {
    var ddBtn = dd.querySelector('.nav__a');
    var timer;
    var setOpen = function (open) { dd.classList.toggle('is-open', open); ddBtn.setAttribute('aria-expanded', open); };
    var hover = window.matchMedia('(hover: hover)').matches;
    ddBtn.addEventListener('click', function () { setOpen(hover || !dd.classList.contains('is-open')); });
    if (hover) {
      dd.addEventListener('mouseenter', function () { clearTimeout(timer); setOpen(true); });
      dd.addEventListener('mouseleave', function () { timer = setTimeout(function () { setOpen(false); }, 180); });
    }
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); } });
  }
  
  var mnav = document.getElementById('mnav');
  if (mnav) {
    var burger = document.getElementById('burger');
    var toggle = function (open) {
      mnav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      document.documentElement.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { toggle(true); });
    mnav.querySelector('.mnav__close').addEventListener('click', function () { toggle(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
  }
  
  var top = document.querySelector('.site-top');
  if (top) {
    var onScroll = function () { top.classList.toggle('is-scrolled', window.scrollY > 4); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  
  var hp = document.querySelector('[data-hpick]');
  if (hp) {
    var tabs = hp.querySelectorAll('.hpick__tab');
    var order = Array.prototype.map.call(tabs, function (b) { return b.dataset.k; });
    var idx = 0, auto = null, picked = false;
    var show = function (k) {
      idx = order.indexOf(k);
      hp.setAttribute('data-active', k);
      tabs.forEach(function (b) { var on = b.dataset.k === k; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
      hp.querySelectorAll('.tile[data-k]').forEach(function (t) { t.classList.toggle('is-on', t.dataset.k === k); });
      hp.querySelectorAll('[data-w]').forEach(function (w) { w.classList.toggle('is-on', w.dataset.w === k); });
      hp.querySelectorAll('.hpick__card').forEach(function (c) {
        var on = c.dataset.k === k;
        c.hidden = !on;
        if (on) { c.classList.remove('is-swap'); void c.offsetWidth; c.classList.add('is-swap'); }
      });
    };
    var stop = function () { clearInterval(auto); auto = null; };
    var start = function () {
      if (auto || picked || reduced) return;
      auto = setInterval(function () { show(order[(idx + 1) % order.length]); }, 4200);
    };
    var pbtn = hp.querySelector('.hpick__pause');
    var setBtn = function (paused) {
      if (!pbtn) return;
      pbtn.setAttribute('aria-pressed', paused);
      pbtn.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
    };
    tabs.forEach(function (b) {
      b.addEventListener('click', function () { picked = true; stop(); setBtn(true); show(b.dataset.k); });
    });
    if (pbtn) {
      if (reduced) pbtn.hidden = true;
      pbtn.addEventListener('click', function () {
        picked = !picked; setBtn(picked);
        if (picked) stop(); else start();
      });
    }
    hp.addEventListener('mouseenter', stop);
    hp.addEventListener('mouseleave', start);
    show(order[0]);
    start();
  }
  
  document.querySelectorAll('.faq details').forEach(function (d) {
    var sum = d.querySelector('summary'), anim = null;
    sum.addEventListener('click', function (e) {
      if (!d.animate || reduced) return;
      e.preventDefault();
      if (anim) anim.cancel();
      d.style.overflow = 'hidden';
      var startH = d.offsetHeight + 'px', opening = !d.open;
      if (opening) d.open = true;
      var endH = (opening ? d.scrollHeight : sum.offsetHeight) + 'px';
      d.classList.toggle('is-closing', !opening);
      anim = d.animate({ height: [startH, endH] }, { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
      anim.onfinish = function () {
        if (!opening) d.open = false;
        d.classList.remove('is-closing'); d.style.overflow = ''; anim = null;
      };
      anim.oncancel = function () { anim = null; };
    });
  });
  
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
(function () {
  var c = document.querySelector('[data-calc]');
  if (!c) return;
  var num = function (s) { return parseInt(String(s).replace(/\D/g, ''), 10) || 0; };
  var TRIP = num(c.dataset.trip), SPUSK = num(c.dataset.spusk), PER = num(c.dataset.bagsPerTrip) || 90;
  var range = c.querySelector('[data-in="bags"]');
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0'); };
  var out = function (k, v) { var el = c.querySelector('[data-out="' + k + '"]'); if (el) el.textContent = v; };
  var plural = function (n, a, b, d) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : d; };
  var pick = function (name) { var on = c.querySelector('[data-in="' + name + '"] [aria-pressed="true"]'); return on ? +on.dataset.v : 0; };
  function calc() {
    var bags = +range.value, floor = pick('floor'), down = pick('down'), lift = pick('lift');
    var trips = Math.max(1, Math.ceil(bags / PER));
    var floors = floor;
    var hourly = !down && (floor <= 2 || lift);
    var spusk = down || hourly ? 0 : bags * floors * SPUSK;
    out('bags', bags);
    out('trips', trips + ' ' + plural(trips, 'рейс', 'рейса', 'рейсов'));
    out('vyvoz', fmt(trips * TRIP));
    out('spusk-txt', down ? 'не нужен' : hourly ? 'почасово, ' + c.dataset.hour + ' лей/час' : bags + ' ' + plural(bags, 'мешок', 'мешка', 'мешков') + ' × ' + floors + ' ' + plural(floors, 'этаж', 'этажа', 'этажей'));
    out('spusk', hourly ? '+ грузчики' : fmt(spusk) + ' лей');
    c.querySelector('[data-out="spusk"]').closest('li').classList.toggle('is-off', !!down);
    out('sum', fmt(trips * TRIP + spusk) + (hourly ? '+' : ''));
    range.style.setProperty('--p', ((bags - range.min) / (range.max - range.min) * 100) + '%');
  }
  range.addEventListener('input', calc);
  c.querySelectorAll('.calc__opts').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      calc();
    });
  });
  calc();
})();
