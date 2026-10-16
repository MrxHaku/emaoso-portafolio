// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Live local time, Cali (America/Bogota)
const clockEl = document.getElementById('localTime');
function tickClock() {
  const now = new Date().toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota',
    hour: '2-digit',
    minute: '2-digit',
  });
  clockEl.textContent = now;
}
tickClock();
setInterval(tickClock, 30000);

// Work list category filter
const filtros = document.getElementById('filtros');
const rows = document.querySelectorAll('#trabajoList .trabajo-row');

filtros.addEventListener('click', (e) => {
  const btn = e.target.closest('.filtro-btn');
  if (!btn) return;

  filtros.querySelectorAll('.filtro-btn').forEach((b) => b.classList.remove('is-active'));
  btn.classList.add('is-active');

  const filtro = btn.dataset.filtro;
  rows.forEach((row) => {
    const match = filtro === 'todo' || row.dataset.cat === filtro;
    row.hidden = !match;
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Custom cursor + hover-tracking project preview
const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

if (!prefersStill && canHover) {
  const cursor = document.getElementById('cursorDot');
  const preview = document.getElementById('rowPreview');
  const previewLabel = document.getElementById('rowPreviewLabel');
  let mx = 0, my = 0;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    preview.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%) scale(${preview.classList.contains('is-visible') ? 1 : 0})`;
  });

  document.querySelectorAll('a, button, .trabajo-row').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-big'));
  });

  rows.forEach((row) => {
    row.addEventListener('mouseenter', () => {
      preview.style.background = row.dataset.color;
      previewLabel.textContent = row.dataset.cat === 'web' ? 'Visitar' : 'Ver';
      preview.classList.add('is-visible');
    });
    row.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
  });
} else {
  document.getElementById('cursorDot').style.display = 'none';
  document.getElementById('rowPreview').style.display = 'none';
}
