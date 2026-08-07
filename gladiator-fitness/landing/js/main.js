// URL del sistema de gestion (frontend React). Cambiar por el dominio
// definitivo cuando el sistema quede publicado (Parte 2 / CI-CD).
const APP_URL = 'http://localhost:5173';

document.querySelectorAll('.app-link').forEach((link) => {
  link.setAttribute('href', APP_URL);
});

const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

navToggle?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
