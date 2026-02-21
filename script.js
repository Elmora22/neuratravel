document.addEventListener('DOMContentLoaded', () => {
  /* ==========================
     CARRUSEL HERO (auto-slide)
     ========================== */
  const slider = document.querySelector('.hero-slider');
  const slides = slider ? Array.from(slider.querySelectorAll('.hero-slide')) : [];

  if (slider && slides.length > 1) {
    // Parámetros
    const DURACION_PAUSA = 3800;   // tiempo visible por slide
    const DURACION_TRANS = 700;    // debe matchear el CSS (.7s)
    let index = 0;
    let timer = null;

    // Asegurar estado inicial
    function aplicarTransform(i) {
      slider.style.transform = `translateX(-${i * 100}%)`;
    }
    aplicarTransform(index);

    function siguiente() {
      index = (index + 1) % slides.length;
      aplicarTransform(index);
    }

    function iniciar() {
      detener();
      timer = setInterval(siguiente, DURACION_PAUSA);
    }
    function detener() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    // Iniciar autoplay
    iniciar();

    // Recalcular en resize (mantiene posición)
    window.addEventListener('resize', () => aplicarTransform(index));

    // Pausar si el usuario prefiere menos animación
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const aplicarRM = () => {
      if (media.matches) {
        detener();
        slider.style.transition = 'none';
      } else {
        slider.style.transition = 'transform .7s ease';
        iniciar();
      }
    };
    media.addEventListener?.('change', aplicarRM);
    aplicarRM();
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
});
