document.addEventListener('DOMContentLoaded', () => {
  /* ==========================
     CARRUSEL HERO (auto-slide)
     ========================== */
  const slider = document.querySelector('.hero-slider');
  const slides = slider ? Array.from(slider.querySelectorAll('.hero-slide')) : [];
  if (slider && slides.length > 1) {
    let index = 0;
    const total = slides.length;
    const INTERVALO_MS = 3000; // 3s

    function irA(i) {
      index = (i + total) % total;
      slider.style.transform = `translateX(-${index * 100}%)`;
    }

    let timer = setInterval(() => irA(index + 1), INTERVALO_MS);

    // Pausa al pasar el mouse (opcional)
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(() => irA(index + 1), INTERVALO_MS);
    });

    window.addEventListener('resize', () => irA(index));
  }

  /* ============================================
     SCROLL SUAVE CON OFFSET (fallback JS)
     ============================================ */
  const soportaSmooth = 'scrollBehavior' in document.documentElement.style;

  const HEADER_OFFSET = 90;         // desktop
  const HEADER_OFFSET_MOBILE = 110; // mobile

  function obtenerOffset() {
    return window.matchMedia('(max-width: 900px)').matches
      ? HEADER_OFFSET_MOBILE
      : HEADER_OFFSET;
  }

  function smoothScrollTo(targetY, duration = 600) {
    const inicioY = window.pageYOffset;
    const distancia = targetY - inicioY;
    let inicioTiempo = null;
    function easeInOutQuad(t){ return t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t; }
    function animarScroll(ts){
      if(!inicioTiempo) inicioTiempo = ts;
      const t = Math.min((ts - inicioTiempo) / duration, 1);
      window.scrollTo(0, inicioY + distancia * easeInOutQuad(t));
      if (t < 1) requestAnimationFrame(animarScroll);
    }
    requestAnimationFrame(animarScroll);
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
    const offsetTop = window.pageYOffset + rect.top - obtenerOffset();
    if (soportaSmooth) {
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    } else {
      smoothScrollTo(offsetTop, 650);
    }
  });

  /* ======================================================
     NAVBAR FIJA SÓLO DESPUÉS DE PASAR EL HEADER
     ====================================================== */
  const navbar = document.querySelector('.navbar');
  const header = document.querySelector('.header');

  if (navbar && header) {
    const setNavH = () => {
      const h = navbar.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--nav-h', `${Math.round(h)}px`);
    };
    setNavH();

    const obtenerUmbral = () => {
      const rect = header.getBoundingClientRect();
      const headerTopDoc = window.pageYOffset + rect.top;
      return headerTopDoc + header.offsetHeight;
    };

    let umbral = obtenerUmbral();

    const aplicarEstado = () => {
      if (window.scrollY >= umbral) {
        document.documentElement.classList.add('nav-fixed');
      } else {
        document.documentElement.classList.remove('nav-fixed');
      }
    };

    window.addEventListener('resize', () => {
      setNavH();
      umbral = obtenerUmbral();
      aplicarEstado();
    });
    window.addEventListener('load', () => {
      umbral = obtenerUmbral();
      aplicarEstado();
    });
    window.addEventListener('scroll', aplicarEstado, { passive: true });
    aplicarEstado();
  }

  /* ============================================
     POPUP DE WHATSAPP (muestra tras 3s de hover/focus)
     No desaparece al pasar del ícono al panel.
     ============================================ */
  const waLink = document.querySelector('.whatsapp');
  if (waLink) {
    // Crear popup dinámicamente (no tocamos tu HTML)
    const popup = document.createElement('div');
    popup.className = 'wa-popup';

    // Usar misma URL/número del enlace flotante
    const waHref = waLink.getAttribute('href') || 'https://wa.me/';

    popup.innerHTML = `
      <div class="wa-popup__header">
        <div class="wa-popup__title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M20.52 3.48A11.8 11.8 0 0 0 12.06 0C5.47 0 .11 5.36.11 11.95c0 2.1.55 4.16 1.6 5.98L0 24l6.25-1.63a12.04 12.04 0 0 0 5.8 1.49h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.2-1.25-6.21-3.49-8.43Z"/>
            <path d="M12.06 22.07h-.01a10.1 10.1 0 0 1-5.15-1.41l-.37-.22-3.71.97.99-3.63-.24-.37a10.1 10.1 0 0 1-1.59-5.46C2 6.39 6.5 1.89 12.06 1.89c2.7 0 5.23 1.05 7.14 2.96a10.01 10.01 0 0 1 2.94 7.1c0 5.56-4.5 10.12-10.08 10.12Z"/>
            <path d="M17.6 14.5c-.3-.15-1.75-.86-2.01-.96-.27-.1-.46-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.74-1.65-2.04-.17-.3-.02-.46.13-.61.14-.14.3-.34.45-.51.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.66-1.58-.9-2.17-.24-.58-.49-.5-.66-.5H7.2c-.2 0-.52.07-.79.37-.27.3-1.04 1-1.04 2.44s1.07 2.83 1.22 3.03c.15.2 2.1 3.21 5.08 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.88.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z" fill="#fff"/>
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

    // Control robusto (no desaparece al pasar del ícono al panel)
    const SHOW_DELAY = 3000; // tiempo de espera (ms)
    const HIDE_DELAY = 180;  // leve demora al salir

    let showTimer = null;
    let hideTimer = null;
    let overBtn = false;
    let overPopup = false;

    const show = () => {
      popup.classList.add('wa-popup--visible');
    };
    const scheduleShow = () => {
      clearTimeout(showTimer);
      showTimer = setTimeout(show, SHOW_DELAY);
    };
    const scheduleHide = () => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!overBtn && !overPopup) {
          popup.classList.remove('wa-popup--visible');
        }
      }, HIDE_DELAY);
    };

    // Estado “sobre el botón” (mouse/teclado)
    waLink.addEventListener('mouseenter', () => { overBtn = true; scheduleShow(); });
    waLink.addEventListener('mouseleave', () => { overBtn = false; scheduleHide(); });
    waLink.addEventListener('focus', () => { overBtn = true; scheduleShow(); });
    waLink.addEventListener('blur', () => { overBtn = false; scheduleHide(); });

    // Estado “sobre el popup”
    popup.addEventListener('mouseenter', () => { overPopup = true; clearTimeout(hideTimer); });
    popup.addEventListener('mouseleave', () => { overPopup = false; scheduleHide(); });

    // Cerrar con X
    popup.querySelector('.wa-popup__close').addEventListener('click', () => {
      overBtn = false; overPopup = false;
      popup.classList.remove('wa-popup--visible');
      clearTimeout(showTimer); clearTimeout(hideTimer);
    });

    // Cerrar con clic fuera
    document.addEventListener('click', (e) => {
      if (!popup.classList.contains('wa-popup--visible')) return;
      const dentroPopup = e.target.closest('.wa-popup');
      const enBoton = e.target.closest('.whatsapp');
      if (!dentroPopup && !enBoton) {
        overBtn = false; overPopup = false;
        popup.classList.remove('wa-popup--visible');
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        overpcional) Tap prolongado en móvil abre el popup
    let touchTimer = null;
    waLink.addEventListener('touchstart', () => {
      touchTimer = setTimeout(show, 600);
    }, { passive: true });
    waLink.addEventListener('touchend', () => {
      clearTimeout(touchTimer);
    });
  }
});
