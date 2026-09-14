/* =========================================================
   SALBO – Materiales de Construcción
   main.js – Vanilla JS interactions
   ========================================================= */

'use strict';

/* ── Scroll: header sticky + scroll-top ── */
(function initScroll() {
  const header    = document.getElementById('header');
  const scrollBtn = document.getElementById('scrollTop');
  if (!header) return;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    if (scrollBtn) {
      scrollBtn.classList.toggle('visible', y > 400);
      scrollBtn.hidden = y <= 400;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Scroll to top ── */
(function() {
  const btn = document.getElementById('scrollTop');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── Mobile hamburger menu ── */
(function initMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('mainNav');
  if (!hamburger || !nav) return;

  function openMenu() {
    hamburger.classList.add('open');
    nav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });

  /* Cerrar al hacer click en un link de nav */
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Cerrar al hacer click fuera */
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') &&
        !hamburger.contains(e.target) &&
        !nav.contains(e.target)) {
      closeMenu();
    }
  });

  /* Cerrar con Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });
})();

/* ── Reveal on scroll (IntersectionObserver + fallback) ── */
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  function revealNow(el) {
    el.classList.add('visible');
  }

  if (!('IntersectionObserver' in window)) {
    items.forEach(revealNow);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealNow(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  items.forEach(el => io.observe(el));

  /* Fallback: if after 800ms some items still haven't revealed
     (e.g. already in viewport on load), force them visible */
  setTimeout(() => {
    items.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 100) revealNow(el);
    });
  }, 800);
})();

/* ── Animated counters ── */
(function initCounters() {
  const counters = document.querySelectorAll('.stats__num[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1800;
      const step = 16;
      const inc  = end / (dur / step);
      let cur = 0;

      const tick = () => {
        cur += inc;
        if (cur < end) {
          el.textContent = Math.floor(cur).toLocaleString('es-AR');
          requestAnimationFrame(tick);
        } else {
          el.textContent = end.toLocaleString('es-AR');
        }
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();

/* =========================================================
   HERO CAROUSEL
   ─────────────────────────────────────────────────────────
   Para agregar imágenes reales: colocá el archivo en
   /assets/img/ y añadí un objeto al array CAROUSEL_SLIDES.
   Si la imagen no existe se genera un placeholder SVG.
   ========================================================= */
(function initHeroCarousel() {

  /* ── 1. Configuración ──────────────────────────────── */
  const INTERVAL   = 5000;   // ms entre slides (5 s)
  const FADE_DUR   = 1000;   // ms de duración del fade
  const PAUSE_HOVER = true;  // pausar al pasar el mouse

  /* Definición de slides.
     src   → ruta relativa desde /assets/img/
     label → etiqueta glassmorphism en la esquina inferior */
  const CAROUSEL_SLIDES = [
    { src: 'assets/img/INICIO1.webp'},
    { src: 'assets/img/INICO2.webp'},
    { src: 'assets/img/INICIO3.webp'},
    { src: 'assets/img/INICIO4.webp'},
  ];

  /* Paletas SVG placeholder por slide (si no hay imagen real) */
  const PLACEHOLDER_PALETTES = [
    { from: '#0D47A1', to: '#1E88E5', accent: '#90CAF9' }, // azul
    { from: '#1B5E20', to: '#388E3C', accent: '#A5D6A7' }, // verde
    { from: '#37474F', to: '#546E7A', accent: '#B0BEC5' }, // acero
    { from: '#BF360C', to: '#E64A19', accent: '#FFCCBC' }, // naranja
    { from: '#4A148C', to: '#7B1FA2', accent: '#CE93D8' }, // violeta
  ];

  /* ── 2. Referencias DOM ────────────────────────────── */
  const carousel   = document.getElementById('heroCarousel');
  const track      = document.getElementById('hcTrack');
  const elCurrent  = document.getElementById('hcCurrent');
  const elTotal    = document.getElementById('hcTotal');

  if (!carousel || !track) return;

  /* ── 3. Estado interno ─────────────────────────────── */
  let current       = 0;
  let timer         = null;
  let isAnimating   = false;
  let isPaused      = false;
  let touchStartX   = 0;
  const total       = CAROUSEL_SLIDES.length;

  /* ── 4. Generar placeholder CSS gradient (liviano) ─── */
  function makePlaceholder(idx) {
    /* Devuelve null → la imagen usará un CSS background-color vía clase */
    return null;
  }

  /* Colores de fondo CSS para cada slide sin imagen real */
  const BG_COLORS = [
    'linear-gradient(135deg,#0A1929 0%,#1565C0 100%)',
    'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)',
    'linear-gradient(135deg,#1C1C2E 0%,#374151 100%)',
    'linear-gradient(135deg,#7C2D12 0%,#C2410C 100%)',
    'linear-gradient(135deg,#312E81 0%,#4338CA 100%)',
  ];

  /* ── 5. Construir slides en el DOM ─────────────────── */
  function buildSlides() {
    track.innerHTML = '';
    CAROUSEL_SLIDES.forEach((data, i) => {
      /* Wrapper slide */
      const slide = document.createElement('div');
      slide.className = 'hc__slide' + (i === 0 ? ' is-active' : '');
      slide.dataset.index = i;
      slide.setAttribute('role', 'tabpanel');
      slide.setAttribute('aria-label', `Imagen ${i + 1}: ${data.label}`);

      /* Fondo CSS de respaldo (siempre aplicado, se cubre con la imagen real) */
      slide.style.background = BG_COLORS[i % BG_COLORS.length];

      /* Imagen real: se carga de forma asíncrona */
      const img = document.createElement('img');
      img.className = 'hc__img';
      img.alt = data.label;
      img.draggable = false;
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.8s ease';

      /* Al cargar: aparecer suavemente sobre el fondo CSS */
      img.onload  = () => { img.style.opacity = '1'; };
      img.onerror = () => { img.style.display = 'none'; }; // muestra fondo CSS
      img.src = data.src;

      /* Overlay degradado */
      const overlay = document.createElement('div');
      overlay.className = 'hc__overlay';
      overlay.setAttribute('aria-hidden', 'true');

      /* Etiqueta glassmorphism */
     const label = document.createElement('div');
     
      slide.append(img, overlay, label);
      track.appendChild(slide);
    });
  }

  /* ── 6. Actualizar UI (contador, si existe en el DOM) ── */
  function updateUI(nextIdx) {
    if (elCurrent) elCurrent.textContent = nextIdx + 1;
    if (elTotal)   elTotal.textContent   = total;
  }

  /* ── 7. Transición entre slides ────────────────────── */
  function goTo(nextIdx, immediate = false) {
    if (isAnimating && !immediate) return;
    if (nextIdx === current && !immediate) return;

    isAnimating = true;
    const slides  = track.querySelectorAll('.hc__slide');
    const prevSlide = slides[current];
    const nextSlide = slides[nextIdx];

    /* Quitar clase leaving anterior si existía */
    slides.forEach(s => s.classList.remove('is-leaving'));

    /* Slide actual → leaving (fade out) */
    prevSlide.classList.remove('is-active');
    prevSlide.classList.add('is-leaving');

    /* Slide siguiente → active (fade in) */
    nextSlide.classList.add('is-active');

    current = nextIdx;
    updateUI(nextIdx);

    /* Limpiar leaving después del fade */
    setTimeout(() => {
      prevSlide.classList.remove('is-leaving');
      isAnimating = false;
    }, FADE_DUR);
  }

  function goNext() { goTo((current + 1) % total); }
  function goPrev() { goTo((current - 1 + total) % total); }

  /* ── 9. Auto-avance ────────────────────────────────── */
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!isPaused) goNext();
    }, INTERVAL);
  }

  function pauseAuto()  { isPaused = true; }
  function resumeAuto() { isPaused = false; }

  /* ── 10. Teclado ───────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    /* Solo actuar si el hero es visible */
    if (window.scrollY > window.innerHeight * 0.6) return;
    if (e.key === 'ArrowLeft')  { goPrev(); startAuto(); }
    if (e.key === 'ArrowRight') { goNext(); startAuto(); }
  });

  /* ── 11. Touch / swipe ─────────────────────────────── */
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goNext() : goPrev();
      startAuto();
    }
  }, { passive: true });

  /* ── 12. Pausar al hover ───────────────────────────── */
  if (PAUSE_HOVER) {
    carousel.addEventListener('mouseenter', pauseAuto);
    carousel.addEventListener('mouseleave', resumeAuto);
  }

  /* ── 13. Init ──────────────────────────────────────── */
  buildSlides();
  updateUI(0);
  startAuto();

})(); /* fin initHeroCarousel */

/* =========================================================
   CARRUSEL "SOBRE NOSOTROS"
   ─────────────────────────────────────────────────────────
   Carrusel liviano con crossfade 100% automático (sin controles)
   para la foto de la sección "¿Quiénes somos?" (nosotros.html).
   Para agregar fotos: sumá un <img class="about-carousel__img">
   dentro de #aboutCarousel.
   ========================================================= */
(function initAboutCarousel() {
  const el = document.getElementById('aboutCarousel');
  if (!el) return;

  const imgs = el.querySelectorAll('.about-carousel__img');
  if (imgs.length < 2) return;

  const INTERVAL = 4500; // ms entre fotos
  let current = 0;
  let timer = null;

  function next() {
    imgs[current].classList.remove('is-active');
    current = (current + 1) % imgs.length;
    imgs[current].classList.add('is-active');
  }

  function start() {
    stop();
    timer = setInterval(next, INTERVAL);
  }
  function stop() { clearInterval(timer); }

  el.addEventListener('mouseenter', stop);
  el.addEventListener('mouseleave', start);

  start();
})();

/* ── Lazy loading images (Intersection Observer) ── */
(function initLazyLoad() {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        io.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });

  imgs.forEach(img => io.observe(img));
})();

/* ── Material tabs (filtrado rápido por categoría) ──
   Las pestañas de categoría son el único filtro del catálogo:
   togglean qué bandas del acordeón quedan visibles. */
(function initMaterialsCatalog() {
  const grid = document.getElementById('materialsGrid');
  if (!grid) return;

  const tabs      = Array.from(document.querySelectorAll('.mat-tab:not(.mat-tab--more)'));
  const extraTabs = tabs.filter(t => t.classList.contains('mat-tab--extra'));
  const moreBtn   = document.getElementById('tabsMoreBtn');
  const allItems  = Array.from(grid.querySelectorAll('.mat-accordion-item'));

  let activeTab = 'all';

  /* Contador de materiales por pestaña (se calcula una sola vez) */
  tabs.forEach(tab => {
    const countBadge = tab.querySelector('[data-count]');
    if (!countBadge) return;
    const filterValue = tab.dataset.filter;
    const total = filterValue === 'all'
      ? allItems.length
      : allItems.filter(c => c.dataset.category === filterValue).length;
    countBadge.textContent = total;
  });

  function applyView() {
    allItems.forEach(item => {
      const show = activeTab === 'all' || item.dataset.category === activeTab;
      item.classList.toggle('hidden', !show);
    });
  }

  /* ── Pestañas ── */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      activeTab = tab.dataset.filter;
      applyView();
    });
  });

  /* ── "Mostrar más" / "Mostrar menos" ── */
  function setExtraTabsVisible(visible) {
    extraTabs.forEach(t => { t.hidden = !visible; });
    if (moreBtn) {
      moreBtn.setAttribute('aria-expanded', String(visible));
      const label = moreBtn.querySelector('.mat-tab__more-label');
      if (label) label.textContent = visible ? 'Mostrar menos' : 'Mostrar más';
    }
  }

  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      const isExpanded = moreBtn.getAttribute('aria-expanded') === 'true';
      setExtraTabsVisible(!isExpanded);
    });
  }

  /* Pre-seleccionar pestaña desde la URL: ?filter=Chapas (usado por el footer/menú) */
  const urlFilter = new URLSearchParams(window.location.search).get('filter');
  if (urlFilter) {
    const matchTab = tabs.find(t => t.dataset.filter === urlFilter);
    if (matchTab) {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
      matchTab.classList.add('active');
      matchTab.setAttribute('aria-pressed', 'true');
      activeTab = urlFilter;
      /* Si la pestaña activada está entre las "extra", desplegarlas */
      if (matchTab.classList.contains('mat-tab--extra')) setExtraTabsVisible(true);
    }
  }

  applyView();

  if (urlFilter) {
    document.getElementById('materiales')?.scrollIntoView({ behavior: 'smooth' });
  }
})();

/* ── Contact form validation + Formspree ── */
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const success   = document.getElementById('formSuccess');
  if (!form) return;

  const SEND_BTN_HTML = `Enviar mensaje <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;

  const validators = {
    cName:    v => v.trim().length >= 2 ? '' : 'Ingresá tu nombre completo.',
    cEmail:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Ingresá un email válido.',
    cMessage: v => v.trim().length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres.',
  };

  function showError(id, msg) {
    const input = document.getElementById(id);
    const err   = document.getElementById(`${id}-error`);
    if (!input || !err) return;
    input.classList.toggle('error', !!msg);
    err.textContent = msg;
  }

  function validateField(id) {
    const input = document.getElementById(id);
    if (!input || !validators[id]) return true;
    const msg = validators[id](input.value);
    showError(id, msg);
    return !msg;
  }

  /* Real-time feedback */
  Object.keys(validators).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('blur', () => validateField(id));
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) validateField(id);
      });
    }
  });

  function resetBtn() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = SEND_BTN_HTML;
  }

  function onSuccess() {
    success.hidden = false;
    form.reset();
    Object.keys(validators).forEach(id => showError(id, ''));
    setTimeout(() => { success.hidden = true; }, 7000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valid = Object.keys(validators).map(id => validateField(id)).every(Boolean);
    if (!valid) return;

    /* Honeypot anti-spam check */
    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value.trim()) return; /* bot detectado, silenciar */

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    const action = form.getAttribute('action') || '';

    /* ── Formspree (acción real) ── */
    if (action.startsWith('http')) {
      try {
        const resp = await fetch(action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        resetBtn();
        if (resp.ok) {
          onSuccess();
        } else {
          const data = await resp.json().catch(() => ({}));
          const errMsg = data?.errors?.map(e => e.message).join(', ') ||
                         'No se pudo enviar. Intentá nuevamente.';
          alert(errMsg);
        }
      } catch {
        resetBtn();
        alert('Error de conexión. Por favor intentá nuevamente.');
      }
      return;
    }

    /* ── Sin acción válida configurada: NO mostramos éxito (no se envió nada) ── */
    resetBtn();
    alert('El formulario no está configurado correctamente. Por favor escribinos por WhatsApp.');
  });
})();

/* ── Consult modal ── */
window.openConsult = function (productName, customMessage) {
  const modal = document.getElementById('consultModal');
  const pEl   = document.getElementById('modalProduct');
  if (!modal) return;
  pEl.textContent = productName;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  /* El enlace de WhatsApp abre el chat sin mensaje predeterminado;
     el cliente escribe lo que quiera. */
  const waLink = modal.querySelector('a[href*="wa.me"]');
  if (waLink) {
    waLink.href = `https://wa.me/5491128482518`;
  }
};

window.closeConsult = function () {
  const modal = document.getElementById('consultModal');
  if (modal) modal.hidden = true;
  document.body.style.overflow = '';
};

/* ── Acordeón de materiales (banda full-width por producto) ──
   Cada <article class="mat-accordion-item"> arranca vacío: este bloque
   arma el header (banda con foto) y el panel (galería + specs + usos)
   a partir de sus data-*. Agregar un material nuevo es sumar un
   <article> más en el HTML con los mismos atributos:
   - data-category, data-name                  → obligatorios
   - data-badge + data-badge-variant            → "stock" (verde) o "featured" (azul)
   - data-gallery="img1.jpg,img2.jpg"           → 1 o más fotos (separadas por coma)
   - data-desc="..."                            → descripción corta
   - data-specs="Calibre 25|1,10m de ancho"      → chips de medidas/calibres
   - data-specs-title="Medidas y calibre"        → título de esos chips (opcional)
   - data-bullets="Uso 1|Uso 2|Uso 3"            → lista con viñetas
   - data-bullets-title="Acabados disponibles"   → título de esa lista (opcional,
     por defecto "Usos y aplicaciones")
   - data-ficha="assets/fichas/x.pdf"            → habilita "Descargar Ficha Técnica" */
(function initMaterialsAccordion() {
  const grid  = document.getElementById('materialsGrid');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.mat-accordion-item'));
  if (!items.length) return;

  const CHEVRON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
  const PREV_SVG    = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
  const NEXT_SVG    = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
  const FICHA_SVG   = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6M9.5 15.5 12 18l2.5-2.5"/></svg>`;

  items.forEach((item, idx) => {
    const name         = item.dataset.name || '';
    const category     = item.dataset.category || '';
    const badge        = item.dataset.badge || '';
    const badgeVariant = item.dataset.badgeVariant === 'featured' ? 'featured' : 'stock';
    const desc         = item.dataset.desc || '';
    const specs        = item.dataset.specs   ? item.dataset.specs.split('|').map(s => s.trim()).filter(Boolean)   : [];
    const specsTitle   = item.dataset.specsTitle || 'Medidas disponibles';
    const bullets      = item.dataset.bullets ? item.dataset.bullets.split('|').map(s => s.trim()).filter(Boolean) : [];
    const bulletsTitle = item.dataset.bulletsTitle || 'Usos y aplicaciones';
    const ficha        = item.dataset.ficha || '';
    const images       = item.dataset.gallery ? item.dataset.gallery.split(',').map(s => s.trim()).filter(Boolean) : [];
    const headerImg    = images[0] || '';
    const multi        = images.length > 1;
    const panelId      = `matPanel${idx}`;
    const headerId     = `matHeader${idx}`;

    /* ── Header: banda full-width con foto de fondo ── */
    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'mat-accordion-item__header';
    header.id = headerId;
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('aria-controls', panelId);
    header.innerHTML = `
      <img class="mat-accordion-item__bg" src="${headerImg}" alt="" loading="lazy" />
      <span class="mat-accordion-item__overlay" aria-hidden="true"></span>
      <span class="mat-accordion-item__text">
        ${badge ? `<span class="badge-pill badge-pill--${badgeVariant}">${badge}</span>` : ''}
        <span class="mat-accordion-item__category">${category}</span>
        <span class="mat-accordion-item__name">${name}</span>
      </span>
      <span class="mat-accordion-item__chevron" aria-hidden="true">${CHEVRON_SVG}</span>
    `;

    /* ── Panel: galería + specs + usos + consultar ── */
    const panel = document.createElement('div');
    panel.className = 'mat-accordion-item__panel';
    panel.id = panelId;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', headerId);
    panel.hidden = true;
    panel.innerHTML = `
      <div class="detail__grid">
        <div class="detail__gallery">
          <div class="detail__main-img-wrap">
            <button type="button" class="detail__nav-btn detail__nav-btn--prev" aria-label="Imagen anterior" ${multi ? '' : 'hidden'}>${PREV_SVG}</button>
            <img class="detail__main-img" src="${headerImg}" alt="${name}" />
            <button type="button" class="detail__nav-btn detail__nav-btn--next" aria-label="Imagen siguiente" ${multi ? '' : 'hidden'}>${NEXT_SVG}</button>
          </div>
          <div class="detail__thumbs" ${multi ? '' : 'hidden'}>
            ${images.map((src, i) => `<button type="button" class="detail__thumb${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="Imagen ${i + 1}"><img src="${src}" alt="" loading="lazy" /></button>`).join('')}
          </div>
        </div>
        <div class="detail__info">
          <p class="detail__desc" ${desc ? '' : 'hidden'}>${desc}</p>
          ${specs.length ? `
          <div class="detail__specs-section">
            <p class="detail__specs-title">${specsTitle}</p>
            <div class="detail__specs">${specs.map(s => `<span class="detail__spec-chip">${s}</span>`).join('')}</div>
          </div>` : ''}
          ${bullets.length ? `
          <div class="detail__bullets-section">
            <p class="detail__bullets-title">${bulletsTitle}</p>
            <ul class="detail__bullets">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>
          </div>` : ''}
          ${ficha ? `<a class="detail__ficha" href="${ficha}" target="_blank" rel="noopener noreferrer">${FICHA_SVG}Descargar Ficha Técnica</a>` : ''}
          <div class="detail__actions">
            <button type="button" class="btn btn--primary btn--lg btn--full detail__consult-btn">Consultar este producto</button>
          </div>
        </div>
      </div>
    `;

    item.appendChild(header);
    item.appendChild(panel);

    /* ── Galería: prev/next/miniaturas, estado propio de este item ── */
    if (multi) {
      let current = 0;
      const mainImg   = panel.querySelector('.detail__main-img');
      const thumbBtns = Array.from(panel.querySelectorAll('.detail__thumb'));
      const prevBtn   = panel.querySelector('.detail__nav-btn--prev');
      const nextBtn   = panel.querySelector('.detail__nav-btn--next');

      function goTo(i) {
        current = (i + images.length) % images.length;
        mainImg.src = images[current];
        thumbBtns.forEach((b, bi) => b.classList.toggle('active', bi === current));
      }
      prevBtn.addEventListener('click', () => goTo(current - 1));
      nextBtn.addEventListener('click', () => goTo(current + 1));
      thumbBtns.forEach((btn, i) => btn.addEventListener('click', () => goTo(i)));
    }

    /* ── Botón "Consultar este producto" ── */
    panel.querySelector('.detail__consult-btn').addEventListener('click', () => {
      window.openConsult(name);
    });

    /* ── Abrir / cerrar banda (un solo panel abierto a la vez) ── */
    header.addEventListener('click', () => {
      const isOpen = header.getAttribute('aria-expanded') === 'true';

      items.forEach(other => {
        const otherHeader = other.querySelector('.mat-accordion-item__header');
        const otherPanel  = other.querySelector('.mat-accordion-item__panel');
        if (!otherHeader || !otherPanel) return;
        otherHeader.setAttribute('aria-expanded', 'false');
        otherPanel.hidden = true;
      });

      if (!isOpen) {
        header.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
})();

/* Close modal on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeConsult();
});

/* ── Smooth scroll for all anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── Placeholder image generator (SVG data URI) ── */
(function generatePlaceholders() {
  const placeholderMap = {
    'hero-bg.jpg':  { label: 'Construcción Moderna',    colors: ['#0D47A1','#1E88E5'], icon: 'building' },
    'about.jpg':    { label: 'Equipo SALBO',            colors: ['#1565C0','#42A5F5'], icon: 'team'     },
    'cement.jpg':   { label: 'Cemento Portland',        colors: ['#607D8B','#90A4AE'], icon: 'cement'   },
    'bricks.jpg':   { label: 'Ladrillos Cerámicos',     colors: ['#BF360C','#E64A19'], icon: 'brick'    },
    'sand.jpg':     { label: 'Arena',                   colors: ['#F9A825','#FFD54F'], icon: 'sand'     },
    'stone.jpg':    { label: 'Piedra Triturada',        colors: ['#546E7A','#78909C'], icon: 'stone'    },
    'iron.jpg':     { label: 'Hierro Corrugado',        colors: ['#37474F','#546E7A'], icon: 'iron'     },
    'paint.jpg':    { label: 'Pinturas',                colors: ['#6A1B9A','#AB47BC'], icon: 'paint'    },
    'slab.jpg':     { label: 'Viguetas y Bovedillas',   colors: ['#1B5E20','#388E3C'], icon: 'slab'     },
    'tiles.jpg':    { label: 'Cerámicos',               colors: ['#004D40','#00897B'], icon: 'tile'     },
    'tools.jpg':    { label: 'Herramientas',            colors: ['#E65100','#FB8C00'], icon: 'tool'     },
  };

  const svgIcons = {
    building: `<path d="M3 21h18M9 21V5l7-2v18M3 7l6-2M16 7h3v14h-3" stroke-width="1.5"/>`,
    team:     `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="1.5"/>`,
    cement:   `<path d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zM12 7V4M8 7V4M16 7V4" stroke-width="1.5"/>`,
    brick:    `<rect x="3" y="8" width="18" height="5" rx="1" stroke-width="1.5"/><rect x="3" y="13" width="8" height="5" rx="1" stroke-width="1.5"/><rect x="13" y="13" width="8" height="5" rx="1" stroke-width="1.5"/>`,
    sand:     `<path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke-width="1.5"/><path d="M8 14s.5-3 4-3 4 3 4 3" stroke-width="1.5" stroke-linecap="round"/>`,
    stone:    `<polygon points="12,3 21,9 18,20 6,20 3,9" stroke-width="1.5"/><path d="M9 12h6M12 9v6" stroke-width="1.5" stroke-linecap="round"/>`,
    iron:     `<path d="M4 6h16M4 12h16M4 18h16" stroke-width="2" stroke-linecap="round"/><path d="M8 6v12M16 6v12" stroke-width="1.5" stroke-linecap="round"/>`,
    paint:    `<path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" stroke-width="1.5"/><circle cx="12" cy="12" r="4" stroke-width="1.5"/>`,
    slab:     `<rect x="3" y="10" width="18" height="4" rx="1" stroke-width="1.5"/><path d="M7 10V7M12 10V5M17 10V7" stroke-width="1.5" stroke-linecap="round"/>`,
    tile:     `<rect x="3" y="3" width="8" height="8" rx="1" stroke-width="1.5"/><rect x="13" y="3" width="8" height="8" rx="1" stroke-width="1.5"/><rect x="3" y="13" width="8" height="8" rx="1" stroke-width="1.5"/><rect x="13" y="13" width="8" height="8" rx="1" stroke-width="1.5"/>`,
    tool:     `<path d="m14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke-width="1.5"/>`,
  };

  document.querySelectorAll('img').forEach(img => {
    const src  = img.getAttribute('src') || '';
    const file = src.split('/').pop();
    const info = placeholderMap[file];
    if (!info) return;

    const [c1, c2] = info.colors;
    const icon = svgIcons[info.icon] || svgIcons.building;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="g${file.replace('.','')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
        <pattern id="dots${file.replace('.','')}" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,.08)"/>
        </pattern>
      </defs>
      <rect width="800" height="500" fill="url(#g${file.replace('.','')})" />
      <rect width="800" height="500" fill="url(#dots${file.replace('.','')})"/>
      <g transform="translate(400,220)" fill="none" stroke="rgba(255,255,255,.6)" stroke-linejoin="round" stroke-linecap="round">
        <g transform="scale(2.8) translate(-12,-12)">${icon}</g>
      </g>
      <text x="400" y="330" font-family="Inter,sans-serif" font-size="18" font-weight="600" fill="rgba(255,255,255,.9)" text-anchor="middle" letter-spacing="1">${info.label}</text>
      <text x="400" y="358" font-family="Inter,sans-serif" font-size="12" font-weight="400" fill="rgba(255,255,255,.5)" text-anchor="middle" letter-spacing="2">SALBO · MATERIALES</text>
    </svg>`;

    const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    img.src = encoded;
    img.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
  });
})();

/* ── Page load animation ── */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  /* Trigger reveal for items in viewport on load */
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('visible');
    }
  });
});
