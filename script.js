document.addEventListener('DOMContentLoaded', () => {
  /* ==========================
     NAV TOGGLE (hamburguesa)
     ========================== */
  const navToggle = document.getElementById('nav-toggle');
  const navbar = document.getElementById('principal-nav');

  function isMobile(){ return window.matchMedia('(max-width: 900px)').matches; }

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
        closeNav(); // desktop: sin colapso (la barra igual se ve)
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
    const PAUSA = 3800;      // tiempo visible
    const TRANS_MS = 700;    // debe matchear CSS
    let timer = null;

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      slider.style.transform = `translateX(-${index * 100}%)`;
    };

    const start = () => { stop(); timer = setInterval(() => goTo(index + 1), PAUSA); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };

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
    slider.addEventListener('touchend', onUp,   { passive: true });
  }

  /* ==========================
     SCROLL SUAVE con offset
     ========================== */
  const soportaSmooth = 'scrollBehavior' in document.documentElement.style;
  const HEADER_OFFSET_DESK = 90;
  const HEADER_OFFSET_MOB  = 110;

  const getOffset = () =>
    window.matchMedia('(max-width: 900px)').matches
      ? HEADER_OFFSET_MOB
      : HEADER_OFFSET_DESK;

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
     NAVBAR FIJA al superar header
     ========================== */
  const navbarEl = document.querySelector('.navbar');
  const headerEl = document.getElementById('site-header');

  if (navbarEl && headerEl) {
    const setNavH = () => {
      const h = navbarEl.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--nav-h', `${Math.round(h)}px`);
    };
    setNavH();

    const getThreshold = () => {
      const rect = headerEl.getBoundingClientRect();
      const top = window.pageYOffset + rect.top;
      return top + headerEl.offsetHeight;
    };

    let threshold = getThreshold();

    const applyState = () => {
      if (window.scrollY >= threshold) document.documentElement.classList.add('nav-fixed');
      else document.documentElement.classList.remove('nav-fixed');
    };

    window.addEventListener('resize', () => {
      setNavH();
      threshold = getThreshold();
      applyState();
    });
    window.addEventListener('load', () => {
      threshold = getThreshold();
      applyState();
    });
    window.addEventListener('scroll', applyState, { passive: true });
    applyState();
  }

 /* ==========================
   WHATSAPP: tooltip + popup tras 2s (estilo captura)
   ========================== */
(function(){
  const waLink = document.querySelector('.whatsapp');
  if (!waLink) return;

  // Evitar duplicados
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
        <a class="wa-popup__cta" href="${waHref}" target="_blank" rel="noopener noreferrer" aria-label="Abrir chat de WhatsApp">
          <span class="wa-popup__cta-icon" aria-hidden="true"></span>
          <span>Abrir chat</span>
        </a>
      </div>
    `;
    document.body.appendChild(popup);
  }

  // Timers y estados
  const SHOW_DELAY = 2000; // ⏱️ 2s
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

  // Mostrar tras 2s de hover/focus sobre el botón
  waLink.addEventListener('mouseenter', () => { overBtn = true; scheduleShow(); });
  waLink.addEventListener('mouseleave', () => { overBtn = false; scheduleHide(); });
  waLink.addEventListener('focus', () => { overBtn = true; scheduleShow(); });
  waLink.addEventListener('blur', () => { overBtn = false; scheduleHide(); });

  // Mantener visible si el cursor entra al popup
  popup.addEventListener('mouseenter', () => { overPopup = true; clearTimeout(hideTimer); });
  popup.addEventListener('mouseleave', () => { overPopup = false; scheduleHide(); });

  // Cerrar con X
  popup.querySelector('.wa-popup__close').addEventListener('click', () => {
    overBtn = false; overPopup = false;
    hide(); clearTimeout(showTimer); clearTimeout(hideTimer);
  });

  // Cerrar con clic fuera
  document.addEventListener('click', (e) => {
    if (!popup.classList.contains('wa-popup--visible')) return;
    const dentroPopup = e.target.closest('.wa-popup');
    const enBoton = e.target.closest('.whatsapp');
    if (!dentroPopup && !enBoton) { overBtn = false; overPopup = false; hide(); }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { overBtn = false; overPopup = false; hide(); } });

  // Móvil: tap prolongado (~600ms) muestra popup sin abrir link
  let touchTimer = null;
  waLink.addEventListener('touchstart', () => { touchTimer = setTimeout(show, 600); }, { passive:true });
  waLink.addEventListener('touchend', () => { clearTimeout(touchTimer); }, { passive:true });

  // Accesible: abrir link con Enter/Espacio
  waLink.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); waLink.click(); }
  });
})();

    // Timers y estados
    const SHOW_DELAY = 2000; // 2s de hover antes de mostrar popup
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

    // Estados sobre el botón (hover/focus)
    waLink.addEventListener('mouseenter', () => { overBtn = true; scheduleShow(); });
    waLink.addEventListener('mouseleave', () => { overBtn = false; scheduleHide(); });
    waLink.addEventListener('focus', () => { overBtn = true; scheduleShow(); });
    waLink.addEventListener('blur', () => { overBtn = false; scheduleHide(); });

    // Estados sobre el popup
    popup.addEventListener('mouseenter', () => { overPopup = true; clearTimeout(hideTimer); });
    popup.addEventListener('mouseleave', () => { overPopup = false; scheduleHide(); });

    // Cerrar con botón X
    popup.querySelector('.wa-popup__close').addEventListener('click', () => {
      overBtn = false; overPopup = false;
      hide(); clearTimeout(showTimer); clearTimeout(hideTimer);
    });

    // Cerrar con clic fuera
    document.addEventListener('click', (e) => {
      if (!popup.classList.contains('wa-popup--visible')) return;
      const dentroPopup = e.target.closest('.wa-popup');
      const enBoton = e.target.closest('.whatsapp');
      if (!dentroPopup && !enBoton) {
        overBtn = false; overPopup = false; hide();
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { overBtn = false; overPopup = false; hide(); }
    });

    // Móvil: tap prolongado (~600ms) muestra popup (sin abrir el link)
    let touchTimer = null;
    waLink.addEventListener('touchstart', () => { touchTimer = setTimeout(show, 600); }, { passive:true });
    waLink.addEventListener('touchend', () => { clearTimeout(touchTimer); }, { passive:true });

    // Accesible: abrir link con Enter/Espacio si el ícono tiene foco
    waLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        waLink.click();
      }
    });
  })();
});

