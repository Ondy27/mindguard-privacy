// galerie: kliknutí na snímek otevře prohlížeč s popiskem, šipkami, náhledy a swipem
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.gal a'));
  if (!links.length || typeof HTMLDialogElement !== 'function') return;

  var items = links.map(function (a) {
    var img = a.querySelector('img'), cap = a.querySelector('span');
    return { src: a.getAttribute('href'), alt: img ? img.alt : '', cap: cap ? cap.textContent : '' };
  });

  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.setAttribute('aria-label', 'Image viewer');
  dlg.setAttribute('data-lenis-prevent', '');
  dlg.tabIndex = -1;
  dlg.innerHTML =
    '<div class="lb-top"><p class="lb-count" aria-live="polite"></p>' +
    '<button class="lb-btn lb-close" type="button" aria-label="Close">×</button></div>' +
    '<figure class="lb-stage"><img class="lb-img" alt=""><figcaption class="lb-cap"></figcaption></figure>' +
    '<button class="lb-btn lb-prev" type="button" aria-label="Previous image">←</button>' +
    '<button class="lb-btn lb-next" type="button" aria-label="Next image">→</button>' +
    '<div class="lb-thumbs"></div>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('.lb-img'), cap = dlg.querySelector('.lb-cap'),
      count = dlg.querySelector('.lb-count'), stage = dlg.querySelector('.lb-stage'),
      thumbs = dlg.querySelector('.lb-thumbs'), current = 0, opener = null;

  items.forEach(function (it, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lb-thumb';
    b.setAttribute('aria-label', it.cap || it.alt);
    b.innerHTML = '<img src="' + it.src + '" alt="" loading="lazy">';
    b.addEventListener('click', function () { show(i); });
    thumbs.appendChild(b);
  });

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // dir: -1 doleva, 1 doprava, 0 bez posunu (otevření, klik na náhled)
  function show(i, dir) {
    current = (i + items.length) % items.length;
    var it = items[current];
    img.classList.remove('in');
    img.style.setProperty('--dx', (dir || 0) * 48 + 'px');
    img.onload = function () { requestAnimationFrame(function () { img.classList.add('in'); }); };
    img.src = it.src;
    img.alt = it.alt;
    cap.textContent = it.cap;
    count.textContent = pad(current + 1) + ' / ' + pad(items.length);
    thumbs.querySelectorAll('.lb-thumb').forEach(function (t, k) {
      t.classList.toggle('on', k === current);
      if (k === current) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
    });
    var on = thumbs.children[current];
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
    [1, -1].forEach(function (d) { new Image().src = items[(current + d + items.length) % items.length].src; });
  }

  function open(i, link) {
    opener = link;
    document.documentElement.classList.add('lb-open');
    if (window.wickLenis) window.wickLenis.stop();
    dlg.showModal();
    dlg.focus(); // fokus na okno, ne na křížek
    show(i, 0);
  }

  dlg.addEventListener('close', function () {
    document.documentElement.classList.remove('lb-open');
    if (window.wickLenis) window.wickLenis.start();
    if (opener) opener.focus();
  });

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(i, a);
    });
  });

  dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1, -1); });
  dlg.querySelector('.lb-next').addEventListener('click', function () { show(current + 1, 1); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1, -1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1, 1); }
  });
  // klik vedle obrázku zavře
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target === stage) dlg.close(); });

  // swipe na dotykových displejích
  var x0 = null;
  stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
  stage.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
})();
