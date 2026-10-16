// Overlay menu (mijobello-style)
const menuToggle = document.getElementById('menuToggle');
const menuOverlay = document.getElementById('menuOverlay');
const menuClose = document.getElementById('menuClose');

function openMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.add('is-open');
  menuToggle?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
  menuClose?.focus();
}

function closeMenu() {
  if (!menuOverlay) return;
  menuOverlay.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  menuToggle?.focus();
}

if (menuToggle && menuOverlay) {
  menuToggle.addEventListener('click', () => {
    const open = menuOverlay.classList.contains('is-open');
    if (open) closeMenu();
    else openMenu();
  });
  menuClose?.addEventListener('click', closeMenu);
  menuOverlay.querySelector('.menu-backdrop')?.addEventListener('click', closeMenu);
  menuOverlay.querySelectorAll('.menu-nav a').forEach((a) => {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('is-open')) closeMenu();
  });
}

// Live local time, Cali (America/Bogota)
const clockEl = document.getElementById('localTime');
if (clockEl) {
  function tickClock() {
    clockEl.textContent = new Date().toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  tickClock();
  setInterval(tickClock, 30000);
}

// Work list category filter
const filtros = document.getElementById('filtros');
const rows = document.querySelectorAll('#trabajoList .trabajo-row');
if (filtros && rows.length) {
  filtros.addEventListener('click', (e) => {
    const btn = e.target.closest('.filtro-btn');
    if (!btn) return;
    filtros.querySelectorAll('.filtro-btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const filtro = btn.dataset.filtro;
    rows.forEach((row) => {
      row.hidden = !(filtro === 'todo' || row.dataset.cat === filtro);
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Custom cursor + project row preview
const prefersStill = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;
const cursor = document.getElementById('cursorDot');
const preview = document.getElementById('rowPreview');

if (!prefersStill && canHover && cursor) {
  const previewLabel = document.getElementById('rowPreviewLabel');
  window.addEventListener('pointermove', (e) => {
    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    if (preview) {
      const vis = preview.classList.contains('is-visible') ? 1 : 0;
      preview.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(${vis})`;
    }
  });
  document.querySelectorAll('a, button, .trabajo-row').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-big'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-big'));
  });
  if (preview && rows.length) {
    rows.forEach((row) => {
      row.addEventListener('mouseenter', () => {
        preview.style.background = row.dataset.color;
        if (previewLabel) previewLabel.textContent = row.dataset.cat === 'web' ? 'Visitar' : 'Ver';
        preview.classList.add('is-visible');
      });
      row.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
    });
  }
} else {
  if (cursor) cursor.style.display = 'none';
  if (preview) preview.style.display = 'none';
}
