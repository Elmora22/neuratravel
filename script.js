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
   WHATSAPP: desactivar popup grande en Desktop
   ========================== */
  (function(){
    // Antes: se creaba un .wa-popup en Desktop tras 2s de hover/focus.
    // Ahora: no hacemos nada para Desktop. En Mobile ya estaba desactivado.
    // Tooltip "¿Necesitas Ayuda?" sigue funcionando vía CSS (.whatsapp::after).
    return;
  })();
});
