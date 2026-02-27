document.addEventListener('DOMContentLoaded', () => {
  /* ==========================
   NAV TOGGLE (hamburguesa)
   ========================== */
  const navToggle = document.getElementById('nav-toggle');
  const navbar = document.getElementById('principal-nav');
  const header = document.getElementById('site-header');
  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  function closeNav() {
    if (!navToggle || !navbar) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navbar.classList.remove('open');
  }
  function openNav() {
    if (!navToggle || !navbar) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navbar.classList.add('open');
  }
  if (navToggle && navbar) {
    navToggle.addEventListener('click', () => {
      if (!isMobile()) return; // evita afectar desktop
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeNav() : openNav();
    });
    // Cerrar al hacer click en un link (sólo mobile)
    navbar.addEventListener('click', (e) => {
      if (!isMobile()) return;
      if (e.target.matches('a')) closeNav();
    });
    // Reset de estado al cambiar el ancho
    const mq = window.matchMedia('(max-width: 900px)');
    const handleMQ = () => {
      if (mq.matches) {
        closeNav(); // mobile: colapsado
      } else {
        closeNav(); // desktop: sin colapso
      }
    };
    mq.addEventListener ? mq.addEventListener('change', handleMQ) : mq.addListener(handleMQ);
    handleMQ();
  }

  /* ==========================
   CARRUSEL HERO (auto + swipe)
   ========================== */
  const slider = document.querySelector('.hero-slider');
  const slides = slider ? Array.from(slider.querySelectorAll('.hero-slide')) : [];
  if (slider && slides.length > 1) {
    let index = 0;
    const PAUSA = 3800; // tiempo visible
    const TRANS_MS = 700; // debe matchear CSS
    let timer = null;
    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      slider.style.transform = `translateX(-${index * 100}%)`;
    };
    const start = () => { stop(); timer = setInterval(() => goTo(index + 1), PAUSA); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    // Estado inicial
    goTo(0);
    start();
    // Mantener posición en resize
    window.addEventListener('resize', () => goTo(index));
    // Pausa al interactuar
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    // Respeto por reduce motion
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyRM = () => {
      if (rm.matches) { stop(); slider.style.transition = 'none'; }
      else { slider.style.transition = `transform ${TRANS_MS}ms ease`; start(); }
    };
    rm.addEventListener?.('change', applyRM);
    applyRM();
    // SWIPE táctil / mouse (pointer)
    let startX = null;
    let isPointerDown = false;
    const onDown = (e) => {
      isPointerDown = true;
      startX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
      stop();
    };
    const onUp = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      const endX = e.clientX ?? (e.changedTouches && e.changedTouches[0]?.clientX) ?? startX;
      const dx = endX - startX;
      const THRESH = 50; // px
      if (dx > THRESH) goTo(index - 1);
      else if (dx < -THRESH) goTo(index + 1);
      start();
    };
    slider.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    slider.addEventListener('touchstart', onDown, { passive: true });
    slider.addEventListener('touchend', onUp, { passive: true });
  }

  /* ==========================
   SCROLL SUAVE con offset del NAV
   ========================== */
  const soportaSmooth = 'scrollBehavior' in document.documentElement.style;
  const getOffset = () =>
    isMobile()
      ? 110           // mobile: margen cómodo por el menú
      : document.body.classList.contains('nav-fixed')
        ? (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),10) || 0)
        : 0;          // desktop: si no está fixed, sin offset

  function smoothScrollTo(targetY, duration = 600) {
    const startY = window.pageYOffset;
    const dist = targetY - startY;
    let t0 = null;
    function easeInOutQuad(t){ return t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t; }
    function step(ts){
      if(!t0) t0 = ts;
      const t = Math.min((ts - t0) / duration, 1);
      window.scrollTo(0, startY + dist * easeInOutQuad(t));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (hash === '#') return;
    const destino = document.querySelector(hash);
    if (!destino) return;
    e.preventDefault();
    const rect = destino.getBoundingClientRect();
    const offsetTop = window.pageYOffset + rect.top - getOffset();
    if (soportaSmooth) window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    else smoothScrollTo(offsetTop, 650);
  });

  /* ==========================
   NAVBAR: fijar al scrollear (Desktop) y compensar altura
   ========================== */
  (function(){
    if (!header || !navbar) return;
    const mqDesktop = window.matchMedia('(min-width: 901px)');
    let triggerY = 0;

    const calcHeights = () => {
      // Altura real del nav
      const navH = Math.round(navbar.getBoundingClientRect().height) || 64;
      document.documentElement.style.setProperty('--nav-h', `${navH}px`);
      // Punto a partir del cual el nav debe fijarse:
      // cuando la parte inferior del header supera el top del viewport
      const headerRect = header.getBoundingClientRect();
      const headerTopAbs = window.scrollY + headerRect.top;
      triggerY = headerTopAbs + header.offsetHeight - navH;
    };

    const applyFixed = () => {
      if (!mqDesktop.matches) {
        // Mobile: nunca fijo
        navbar.classList.remove('navbar--fixed');
        document.body.classList.remove('nav-fixed');
        document.body.style.paddingTop = '0px';
        return;
      }
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),10) || 64;
      if (window.scrollY >= triggerY) {
        if (!navbar.classList.contains('navbar--fixed')) {
          navbar.classList.add('navbar--fixed');
          document.body.classList.add('nav-fixed');
          document.body.style.paddingTop = `${navH}px`; // evita “salto” del contenido
        }
      } else {
        if (navbar.classList.contains('navbar--fixed')) {
          navbar.classList.remove('navbar--fixed');
          document.body.classList.remove('nav-fixed');
          document.body.style.paddingTop = '0px';
        }
      }
    };

    const onResizeOrLoad = () => { calcHeights(); applyFixed(); };
    const onScroll = () => { applyFixed(); };

    // Observa cambios en el tamaño del nav (wrap, fuentes, etc.)
    try { new ResizeObserver(onResizeOrLoad).observe(navbar); } catch {}
    mqDesktop.addEventListener ? mqDesktop.addEventListener('change', onResizeOrLoad) : mqDesktop.addListener(onResizeOrLoad);
    window.addEventListener('load', onResizeOrLoad);
    window.addEventListener('resize', onResizeOrLoad);
    window.addEventListener('scroll', onScroll, { passive:true });

    // init
    onResizeOrLoad();
  })();

  /* ==========================
   WHATSAPP: tooltip + popup a los 2s (solo DESKTOP)
   ========================== */
  (function(){
    const waLink = document.querySelector('.whatsapp');
    if (!waLink) return;
    if (isMobile()) return; // en móvil no mostramos popup
    // Crear popup si no existe
    let popup = document.querySelector('.wa-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.className = 'wa-popup';
      const waHref = waLink.getAttribute('href') || 'https://wa.me/';
      popup.innerHTML = `
        <div class="wa-popup__header">
          <div class="wa-popup__title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
              <path d="M20.52 3.48A11.8 11.8 0 0 0 12.06 0C5.47 0 .11 5.36.11 11.95c0 2.1.55 4.16 1.6 5.98L0 24l6.25-1.63a12.04 12.04 0 0 0 5.8 1.49h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.2-1.25-6.21-3.49-8.43Z"></path>
              <path d="M12.06 22.07h-.01a10.1 10.1 0 0 1-5.15-1.41l-.37-.22-3.71.97.99-3.63-.24-.37a10.1 10.1 0 0 1-1.59-5.46C2 6.39 6.5 1.89 12.06 1.89c2.7 0 5.23 1.05 7.14 2.96a10.01 10.01 0 0 1 2.94 7.1c0 5.56-4.5 10.12-10.08 10.12Z"></path>
              <path d="M17.6 14.5c-.3-.15-1.75-.86-2.01-.96-.27-.1-.46-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.74-1.65-2.04-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.51.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.58-.9-2.17-.24-.58-.49-.5-.66-.5H7.2c-.2 0-.52.07-.79.37-.27.3-1.04 1-1.04 2.44s1.07 2.83 1.22 3.03c.15.2 2.1 3.21 5.08 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" fill="#fff"></path>
            </svg>
            <span>WhatsApp</span>
          </div>
          <button class="wa-popup__close" type="button" aria-label="Cerrar">×</button>
        </div>
        <div class="wa-popup__body">
          <div class="wa-bubble">
            <div>Hola ♥</div>
            <div>¿En qué podemos ayudarte?</div>
          </div>
          ${waHref}
            <span class="wa-popup__cta-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.5 3.5A11 11 0 0 0 3.6 20.4L2 22l1.9-.5A11 11 0 1 0 20.5 3.5Z"/>
                <path d="M16.2 14.3c-.3-.1-1.7-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.4.2-.6.1-1.2-.6-2.2-1.4-3-2.6-.2-.2-.1-.4.1-.6.1-.2.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.3 0-.6-.1-.2-.6-1.5-.8-2 0-.2-.2-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.6.6-.9 1.4-.9 2.2 0 .3 0 .6.1.9.2.7.6 1.4 1.1 2 .6.7 1.3 1.3 2.1 1.7.8.4 1.7.7 2.6.8.3 0 .6 0 .8-.1.6-.2 1.4-.7 1.6-1.3.2-.5.2-1 .1-1.1-.1-.1-.3-.2-.6-.3Z" fill="white"/>
              </svg>
            </span>
            <span>Abrir chat</span>
          </a>
        </div>
      `;
      document.body.appendChild(popup);
    }
    const SHOW_DELAY = 2000;
    const HIDE_DELAY = 180;
    let showTimer = null;
    let hideTimer = null;
    let overBtn = false;
    let overPopup = false;
    const show = () => popup.classList.add('wa-popup--visible');
    const hide = () => popup.classList.remove('wa-popup--visible');
    const scheduleShow = () => { clearTimeout(showTimer); showTimer = setTimeout(show, SHOW_DELAY); };
    const scheduleHide = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { if (!overBtn && !overPopup) hide(); }, HIDE_DELAY);
    };
    waLink.addEventListener('mouseenter', () => { overBtn = true; scheduleShow(); });
    waLink.addEventListener('mouseleave', () => { overBtn = false; scheduleHide(); });
    waLink.addEventListener('focus', () => { overBtn = true; scheduleShow(); });
    waLink.addEventListener('blur', () => { overBtn = false; scheduleHide(); });
    popup.addEventListener('mouseenter', () => { overPopup = true; clearTimeout(hideTimer); });
    popup.addEventListener('mouseleave', () => { overPopup = false; scheduleHide(); });
    popup.querySelector('.wa-popup__close').addEventListener('click', () => {
      overBtn = false; overPopup = false;
      hide(); clearTimeout(showTimer); clearTimeout(hideTimer);
    });
    document.addEventListener('click', (e) => {
      if (!popup.classList.contains('wa-popup--visible')) return;
      const dentroPopup = e.target.closest('.wa-popup');
      const enBoton = e.target.closest('.whatsapp');
      if (!dentroPopup && !enBoton) { overBtn = false; overPopup = false; hide(); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { overBtn = false; overPopup = false; hide(); }
    });
  })();
});
