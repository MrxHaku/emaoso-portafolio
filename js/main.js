// Overlay menu
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

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
