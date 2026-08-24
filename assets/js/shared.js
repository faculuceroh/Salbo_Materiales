/* =========================================================
   SALBO – shared.js
   Inyecta header y footer en todas las páginas.
   Se carga ANTES de main.js (orden de <script defer>).
   =========================================================

   Para agregar una página nueva:
   1. Agregar entrada en NAV_PAGES
   2. Crear el archivo HTML con <body data-page="clave">
   ========================================================= */

'use strict';

(function () {

  /* ── Definición de páginas ── */
  const NAV_PAGES = [
    { key: 'inicio',      label: 'Inicio',      href: 'index.html'      },
    { key: 'nosotros',    label: 'Nosotros',     href: 'nosotros.html'   },
    { key: 'materiales',  label: 'Materiales',   href: 'materiales.html' },
    { key: 'contacto',    label: 'Contacto',     href: 'contacto.html'   },
  ];

  /* Detectar página activa desde atributo data-page del <body> */
  const activePage = document.body.dataset.page || 'inicio';

  /* ── Categorías del dropdown de Materiales ── */
  const MAT_CATEGORIES = [
    {
      label: 'Todos los materiales',
      href:  'materiales.html',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    },
    {
      label: 'Chapas',
      href:  'materiales.html?filter=Chapas',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9h20M2 15h20M2 3h20M2 21h20"/></svg>`,
    },
    {
      label: 'Perfiles',
      href:  'materiales.html?filter=Perfiles',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h6"/></svg>`,
    },
    {
      label: 'Tornillos',
      href:  'materiales.html?filter=Tornillos',
      icon:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
    },
  ];

  /* ── Chevron SVG reutilizable ── */
  const CHEVRON_SVG = `<svg class="nav__chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;

  /* ── Builder del header ── */
  function buildHeader() {
    const navItems = NAV_PAGES.map(p => {
      const isActive = p.key === activePage;

      /* Entrada especial: Materiales → tiene dropdown */
      if (p.key === 'materiales') {
        const dropItems = MAT_CATEGORIES.map((cat, idx) => `
          ${idx === 1 ? '<li class="nav__dropdown-divider" role="separator"></li>' : ''}
          <li role="none">
            <a href="${cat.href}" class="nav__dropdown-link" role="menuitem">
              ${cat.icon}
              ${cat.label}
            </a>
          </li>`).join('');

        return `
      <li class="nav__item nav__item--has-dropdown" role="none">
        <div class="nav__link-group">
          <a href="${p.href}"
             class="nav__link${isActive ? ' active' : ''}"
             ${isActive ? 'aria-current="page"' : ''}
             role="menuitem">
            ${p.label}
          </a>
          <button class="nav__dropdown-toggle"
                  aria-label="Ver categorías de materiales"
                  aria-expanded="false"
                  aria-haspopup="true"
                  type="button">
            ${CHEVRON_SVG}
          </button>
        </div>
        <ul class="nav__dropdown" role="menu" aria-label="Categorías de materiales">
          ${dropItems}
        </ul>
      </li>`;
      }

      /* Resto de páginas → link normal */
      return `
      <li role="none">
        <a href="${p.href}"
           class="nav__link${isActive ? ' active' : ''}"
           ${isActive ? 'aria-current="page"' : ''}
           role="menuitem">
          ${p.label}
        </a>
      </li>`;
    }).join('');

    return `
    <header class="header" id="header" role="banner">
      <div class="header__container">

        <!-- Logo -->
        <a href="index.html" class="header__logo" aria-label="SALBO – Inicio">
          <img src="assets/img/SALBO_LOGO.jpeg" alt="SALBO Logo" class="header__logo-img" />
        </a>

        <!-- Nav desktop -->
        <nav class="header__nav" id="mainNav"
             role="navigation" aria-label="Navegación principal">
          <ul class="nav__list" role="menubar">${navItems}</ul>
        </nav>

        <!-- Buscador (solo visible en materiales) -->
        <div class="header__search">
          <form class="search-form" role="search" onsubmit="handleSearchSubmit(event)">
            <input type="search" id="headerSearch" class="search-form__input"
                   placeholder="Buscar materiales…" aria-label="Buscar materiales"
                   autocomplete="off" />
            <button type="submit" class="search-form__btn" aria-label="Buscar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.5"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>
        </div>

        <!-- Hamburger -->
        <button class="header__hamburger" id="hamburger"
                aria-label="Abrir menú" aria-expanded="false"
                aria-controls="mainNav" type="button">
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
          <span class="hamburger__line"></span>
        </button>

      </div>
    </header>`;
  }

  /* ── Builder del footer ── */
  function buildFooter() {
    const footerLinks = NAV_PAGES.map(p =>
      `<li><a href="${p.href}" class="footer__link">${p.label}</a></li>`
    ).join('');

    return `
    <footer class="footer" role="contentinfo">
      <div class="footer__top">
        <div class="container">
          <div class="footer__grid">

            <!-- Brand -->
            <div class="footer__col footer__col--brand">
              <a href="index.html" class="footer__logo" aria-label="SALBO – Ir al inicio">
                <img src="assets/img/SALBO_LOGO.jpeg" alt="SALBO Logo" class="footer__logo-img" />
              </a>
              <p class="footer__tagline">
                Tu proveedor de confianza en materiales de construcción de calidad.
              </p>
              <div class="footer__social" role="list" aria-label="Redes sociales">
                <a href="https://www.instagram.com/salbomateriales/" class="footer__social-link" aria-label="Instagram" role="listitem">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round"
                       stroke-linejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61566360036466&locale=es_LA" class="footer__social-link" aria-label="Facebook" role="listitem">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round"
                       stroke-linejoin="round" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://wa.me/5491128482518" target="_blank"
                   rel="noopener noreferrer"
                   class="footer__social-link footer__social-link--wa"
                   aria-label="WhatsApp" role="listitem">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Navegación -->
            <div class="footer__col">
              <h4 class="footer__col-title">Navegación</h4>
              <ul class="footer__links">${footerLinks}</ul>
            </div>

            <!-- Materiales rápidos -->
            <div class="footer__col">
              <h4 class="footer__col-title">Materiales</h4>
              <ul class="footer__links">
                <li><a href="materiales.html?filter=Chapas" class="footer__link">Chapas</a></li>
                <li><a href="materiales.html?filter=Perfiles" class="footer__link">Perfiles</a></li>
                <li><a href="materiales.html?filter=Tornillos" class="footer__link">Tornillos</a></li>
              </ul>
            </div>

            <!-- Contacto -->
            <div class="footer__col">
              <h4 class="footer__col-title">Contacto</h4>
              <ul class="footer__contact-list">
                <li>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                 Buenos Aires, Argentina
                </li>
                <li>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.1 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.17h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
                  </svg>
                  <a href="tel:+5491128482518">+54 9 11 2848-2518</a>
                </li>
                <li>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-10 7L2 7"/>
                  </svg>
                  <!-- Email obfuscado: ensamblado por JS -->
                  <span class="js-email" data-u="Salboventas" data-d="gmail" data-t="com" data-style="footer">
                    <noscript>Salboventas [arroba] gmail.com</noscript>
                  </span>
                </li>
                <li>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Lun–Vie 8:00–16:00 · Sáb 8:00–12:00
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="container">
          <p class="footer__copy">
            © ${new Date().getFullYear()} SALBO – Materiales de Construcción.
            Todos los derechos reservados.
          </p>
          <p class="footer__copy footer__copy--right">Desarrollado por Luceros </p>
        </div>
      </div>
    </footer>

    <!-- Botón flotante WhatsApp -->
    <a href="https://wa.me/5491128482518" target="_blank" rel="noopener noreferrer"
       class="wa-float" aria-label="Contactar por WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
      <span class="wa-float__tooltip">¿Necesitás ayuda?</span>
    </a>

    <!-- Scroll to top -->
    <button class="scroll-top" id="scrollTop" aria-label="Volver arriba" hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m18 15-6-6-6 6"/>
      </svg>
    </button>`;
  }

  /* ── Inyección en el DOM ── */
  const headerSlot = document.getElementById('site-header');
  const footerSlot = document.getElementById('site-footer');

  if (headerSlot) headerSlot.outerHTML = buildHeader();
  if (footerSlot) footerSlot.outerHTML = buildFooter();

  /* ── Email obfuscation: ensamblar emails desde data-attributes ──
     data-style="page" → enlace con color de página (no footer blanco) */
  document.querySelectorAll('.js-email').forEach(el => {
    const email = `${el.dataset.u}@${el.dataset.d}.${el.dataset.t}`;
    const cls   = el.dataset.style === 'page' ? 'js-email-link' : 'footer__link';
    el.innerHTML = `<a href="mailto:${email}" class="${cls}">${email}</a>`;
  });

})();
