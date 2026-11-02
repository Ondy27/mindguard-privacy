// galerie: snímek se z dlaždice zvětší přes celou obrazovku a při zavření se do ní vrátí
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.gal a'));
  if (!links.length || typeof HTMLDialogElement !== 'function') return;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var items = links.map(function (a) {
    var img = a.querySelector('img'), cap = a.querySelector('span');
    return { src: a.getAttribute('href'), alt: img ? img.alt : '', cap: cap ? cap.textContent : '' };
  });

  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.tabIndex = -1;
  dlg.setAttribute('aria-label', 'Screenshots from The Last Mosswarden');
  dlg.setAttribute('data-lenis-prevent', '');
  dlg.innerHTML =
    '<div class="lb-bar"><p class="lb-count" aria-live="polite"></p><div class="lb-nav">' +
    '<button class="ul lb-prev" type="button">← Prev</button>' +
    '<button class="ul lb-next" type="button">Next →</button>' +
    '<button class="ul lb-close" type="button">Close</button></div></div>' +
    '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
    '<div class="lb-foot"><p class="lb-cap"></p><p class="lb-hint">← → to browse · Esc to close</p></div>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('.lb-img'), cap = dlg.querySelector('.lb-cap'),
      count = dlg.querySelector('.lb-count'), stage = dlg.querySelector('.lb-stage'),
      current = 0, busy = false;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // transformace, která obrázek posadí přesně na místo dlaždice
  function toTile(i) {
    var t = links[i].getBoundingClientRect(), r = img.getBoundingClientRect();
    return 'translate(' + (t.left - r.left) + 'px,' + (t.top - r.top) + 'px) scale(' + (t.width / r.width) + ',' + (t.height / r.height) + ')';
  }

  function fill(i) {
    var it = items[i];
    count.textContent = pad(i + 1) + ' / ' + pad(items.length);
    cap.textContent = it.cap;
    img.alt = it.alt;
    [1, -1].forEach(function (d) { new Image().src = items[(i + d + items.length) % items.length].src; });
  }

  function open(i) {
    current = i;
    fill(i);
    document.documentElement.classList.add('lb-open');
    if (window.wickLenis) window.wickLenis.stop();
    img.style.transition = 'none';
    img.style.opacity = '0';
    img.onload = function () {
      img.onload = null;
      if (!still) img.style.transform = toTile(i);
      img.style.opacity = '1';
      img.getBoundingClientRect();
      img.style.transition = '';
      img.style.transform = '';
    };
    img.src = items[i].src;
    dlg.classList.remove('out');
    dlg.showModal();
    dlg.focus();
  }

  function close() {
    if (busy || !dlg.open) return;
    busy = true;
    dlg.classList.add('out');
    if (!still) img.style.transform = toTile(current);
    setTimeout(function () {
      dlg.close();
      busy = false;
    }, still ? 0 : 520);
  }

  function go(d) {
    if (busy) return;
    busy = true;
    current = (current + d + items.length) % items.length;
    img.style.setProperty('--dx', d * -40 + 'px');
    img.classList.add('swap');
    setTimeout(function () {
      img.onload = function () {
        img.onload = null;
        img.style.setProperty('--dx', d * 40 + 'px');
        img.getBoundingClientRect();
        img.classList.remove('swap');
        busy = false;
      };
      img.src = items[current].src;
      fill(current);
    }, still ? 0 : 200);
  }

  dlg.addEventListener('close', function () {
    document.documentElement.classList.remove('lb-open');
    if (window.wickLenis) window.wickLenis.start();
    links[current].focus({ preventScroll: true });
  });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(i);
    });
  });

  dlg.querySelector('.lb-close').addEventListener('click', close);
  dlg.querySelector('.lb-prev').addEventListener('click', function () { go(-1); });
  dlg.querySelector('.lb-next').addEventListener('click', function () { go(1); });
  img.addEventListener('click', function () { go(1); });
  stage.addEventListener('click', function (e) { if (e.target === stage) close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });

  // swipe na dotykových displejích
  var x0 = null;
  stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
  stage.addEventListener('pointerup', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  });
})();
