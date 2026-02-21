document.addEventListener('DOMContentLoaded', () => {
  /* ==========================
     CARRUSEL HERO (auto-slide)
     ========================== */
  const slider = document.querySelector('.hero-slider');
  const slides = slider ? Array.from(slider.querySelectorAll('.hero-slide')) : [];
  if (slider && slides.length > 1) {
    let index = 0;
    const total = slides.length;
    const INTERVALO_MS = 3500;

    function irA(i) {
      index = (i + total) % total;
      slider.style.transform = `translateX(-${index * 100}%)`;
    }

    let timer = setInterval(() => irA(index + 1), INTERVALO_MS);

    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => {
      clearInterval(timer);
      timer = setInterval(() => irA(index + 1), INTERVALO_MS);
    });

    window.addEventListener('resize', () => irA(index));
  }

  /* ==========================
     SCROLL SUAVE con offset
     ========================== */
  const soportaSmooth = 'scrollBehavior' in document.documentElement.style;
  const HEADER_OFFSET = 90;
  const HEADER_OFFSET_MOBILE = 110;

  const obtenerOffset = () =>
    window.matchMedia('(max-width: 900px)').matches
      ? HEADER_OFFSET_MOBILE
      : HEADER_OFFSET;

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

  /* ==========================
     NAVBAR FIJA al superar header
     ========================== */
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

  /* ==========================
     POPUP WhatsApp simple (opcional)
     ========================== */
  const waLink = document.querySelector('.whatsapp');
  if (waLink) {
    // Abrir chat al presionar Enter/Espacio (accesible)
    waLink.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        waLink.click();
      }
    });
  }
});
