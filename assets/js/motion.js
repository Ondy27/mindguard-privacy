// pohyb při scrollu: plynulý scroll (Lenis) + scrollem řízené přechody (GSAP ScrollTrigger)
(function () {
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('motion');

  // plynulý scroll: dlouhý dojezd s exponenciálním dobrzděním
  var lenis = new Lenis({
    duration: 1.8,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  window.wickLenis = lenis; // galerie ho při otevření prohlížeče zastaví
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // kotvy (#projects, #contact…) dojíždí stejně plynule
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'), target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#top' ? -200 : 0, duration: 2.2 });
      history.replaceState(null, '', id);
    });
  });

  // tenký proužek průběhu nahoře
  var bar = document.querySelector('.progress');
  if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  var mm = gsap.matchMedia();

  // úvod: sekce se přišpendlí, nadpis ustoupí a obrázek z lesa vyjede nahoru
  mm.add('(min-width: 768px)', function () {
    var hero = document.querySelector('#top'), inner = hero.querySelector('.hero-inner');
    var tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=110%', scrub: 1, pin: true, invalidateOnRefresh: true }
    });
    tl.to(inner, { y: function () { return -Math.max(0, inner.offsetHeight + 120 - window.innerHeight); }, ease: 'power1.inOut' }, 0)
      .to('.hero-head', { autoAlpha: 0.12, scale: 0.94, transformOrigin: '50% 0%', ease: 'none' }, 0)
      .fromTo('.hero-media', { scale: 0.9 }, { scale: 1, ease: 'none' }, 0);
  });

  // nadpisy a řádky naskakují zespodu, vázané přímo na scroll
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.fromTo(el, { autoAlpha: 0, y: 90 }, {
      autoAlpha: 1, y: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 65%', scrub: 1 }
    });
  });

  // paralaxa: sloupce se posouvají proti sobě (data-par = výchozí posun v px)
  mm.add('(min-width: 640px)', function () {
    gsap.utils.toArray('[data-par]').forEach(function (el) {
      gsap.fromTo(el, { y: +el.dataset.par }, {
        y: 0, ease: 'none',
        scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'center center', scrub: true }
      });
    });
  });

  // galerie: dlaždice dojíždí každá trochu jinak rychle
  gsap.utils.toArray('.gal a').forEach(function (el, i) {
    gsap.fromTo(el, { y: 60 + (i % 3) * 40, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 70%', scrub: 1 }
    });
  });

  // Maturitko zůstane stát a tmavý panel Mosswardena přes něj přejede
  mm.add('(min-width: 768px)', function () {
    var under = document.querySelector('#maturitko'), over = document.querySelector('#mosswarden');
    gsap.timeline({
      scrollTrigger: { trigger: under, start: 'bottom bottom', endTrigger: over, end: 'top top', scrub: true, pin: true, pinSpacing: false }
    }).to(under, { scale: 0.92, autoAlpha: 0.25, ease: 'none' });
    gsap.fromTo(over, { borderRadius: '48px 48px 0 0' }, {
      borderRadius: '0px 0px 0 0', ease: 'none',
      scrollTrigger: { trigger: over, start: 'top bottom', end: 'top top', scrub: true }
    });
  });

  // studio: nadpis plave pomaleji než text vedle
  mm.add('(min-width: 1024px)', function () {
    gsap.fromTo('.studio-head', { y: -120 }, {
      y: 120, ease: 'none',
      scrollTrigger: { trigger: '#studio', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // patička: velké logo vyjíždí, jak se stránka blíží konci
  gsap.fromTo('.foot-logo', { yPercent: 40, autoAlpha: 0 }, {
    yPercent: 0, autoAlpha: 1, ease: 'none',
    scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom bottom', scrub: 1 }
  });

  // maskot Wicky: sedí u nadpisu a při scrollu přelétá po oblouku mezi sekcemi
  var mascot = document.querySelector('.mascot');
  if (mascot && window.MotionPathPlugin) {
    gsap.registerPlugin(MotionPathPlugin);
    gsap.set(mascot, { xPercent: -50, yPercent: -50 });

    // poloha v dokumentu bez transformací (paralaxa ani přišpendlení ji nerozhodí)
    var docPos = function (el) {
      var x = 0, y = 0;
      for (var n = el; n; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
    };
    var perch = function (sel, fx, fy, dx, dy) {
      var el = document.querySelector(sel);
      if (!el) return null;
      var p = docPos(el);
      return { x: p.x + p.w * fx + (dx || 0), y: p.y + p.h * fy + (dy || 0) };
    };
    var heroPerch = function () {
      var h1 = document.querySelector('#top h1'), top = document.querySelector('#top'),
          box = docPos(top.parentNode.classList.contains('pin-spacer') ? top.parentNode : top);
      return { x: box.x + h1.offsetLeft + h1.offsetWidth * 0.9, y: box.y + h1.offsetTop + h1.offsetHeight * 0.55 };
    };

    // jak je maskot nakloněný, záleží na rychlosti scrollu
    var tilt = gsap.quickTo(mascot.querySelector('.mascot-tilt'), 'rotation', { duration: 0.6, ease: 'power3' });
    lenis.on('scroll', function (l) { tilt(gsap.utils.clamp(-16, 16, l.velocity * 0.5)); });

    ['#mosswarden', '#contact'].forEach(function (sel) {
      ScrollTrigger.create({ trigger: sel, start: 'top 45%', end: 'bottom 45%', toggleClass: { targets: mascot, className: 'on-dark' } });
    });

    mm.add('(min-width: 1024px)', function () {
      var flight = null;
      var build = function () {
        if (flight) flight.scrollTrigger.kill(), flight.kill();
        var vh = window.innerHeight, max = ScrollTrigger.maxScroll(window),
            stops = [
              heroPerch(),
              perch('#projects h2', 1, 0.5, 70),
              perch('#mindguard [data-par="-110"]', 1, 0, -30, -20),
              perch('#streakly [data-par="-90"]', 1, 0, 10, -30),
              perch('#mosswarden figure', 0, 0, -10, -50),
              perch('#studio ol', 1, 0, -30, -50),
              perch('#contact a.ul', 1, 0.5, 70)
            ].filter(Boolean);
        gsap.set(mascot, { x: stops[0].x, y: stops[0].y });
        flight = gsap.timeline({ scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });
        var at = 0, from = stops[0];
        stops.slice(1).forEach(function (to) {
          // přiletí ve chvíli, kdy je cíl ve 42 % výšky okna
          var when = Math.min(max, Math.max(0, to.y - vh * 0.42));
          if (when < at + 80) return;
          // oblouk vede přes volný pravý okraj, ať nepřeletí přes text
          var mid = { x: Math.min(window.innerWidth - 50, Math.max(from.x, to.x) + 140), y: (from.y + to.y) / 2 - vh * 0.1 };
          flight.to(mascot, { motionPath: { path: [mid, { x: to.x, y: to.y }], curviness: 1.3 }, duration: when - at, ease: 'power1.inOut' }, at);
          at = when;
          from = to;
        });
        flight.to({}, { duration: Math.max(1, max - at) }, at);
      };
      build();
      ScrollTrigger.addEventListener('refresh', build);
      return function () {
        ScrollTrigger.removeEventListener('refresh', build);
        if (flight) flight.scrollTrigger.kill(), flight.kill();
      };
    });

    // na menších displejích jen sedí v úvodu u nadpisu
    mm.add('(max-width: 1023px)', function () {
      var place = function () { var p = heroPerch(); gsap.set(mascot, { x: Math.min(p.x, window.innerWidth - 40), y: p.y }); };
      place();
      ScrollTrigger.addEventListener('refresh', place);
      return function () { ScrollTrigger.removeEventListener('refresh', place); };
    });
  }

  // obrázky se načítají líně, po načtení přepočítat pozice
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
