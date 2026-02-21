document.addEventListener('DOMContentLoaded', () => {
  // ===== NAV TOGGLE (hamburguesa) =====
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
    if (!isMobile()) return; // <-- evita afectar desktop
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeNav() : openNav();
  });

  // Cerrar al hacer click en un link (sólo mobile)
  navbar.addEventListener('click', (e) => {
    if (!isMobile()) return;
    if (e.target.matches('a')) closeNav();
  });

  // Al cambiar el ancho de pantalla: resetear estado correctamente
  const mq = window.matchMedia('(max-width: 900px)');
  const handleMQ = () => {
    if (mq.matches) {
      // Mobile: empezar colapsado
      closeNav();
    } else {
      // Desktop: asegurar nav abierto visualmente
      closeNav(); // quita clases/aria, y desktop no usa colapso
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
});

