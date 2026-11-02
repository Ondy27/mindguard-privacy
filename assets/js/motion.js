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

  // obrázky se načítají líně, po načtení přepočítat pozice
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
