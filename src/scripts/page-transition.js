import { gsap } from '../gsap.js';

// «Завіса» між сторінками. Сайт багатосторінковий (Astro), тому:
// клік по внутрішньому посиланню → завіса закриває екран → перехід →
// на новій сторінці завіса відкривається.
const KEY = 'museum-curtain';

export default function initPageTransition() {
  const curtain = document.querySelector('.curtain');
  if (!curtain) return;
  const mark = curtain.querySelector('.curtain__mark');

  let fromTransition = false;
  try {
    fromTransition = sessionStorage.getItem(KEY) === '1';
    sessionStorage.removeItem(KEY);
  } catch {
    /* сховище недоступне */
  }

  if (fromTransition) {
    gsap
      .timeline()
      .set(curtain, { display: 'flex', scaleY: 1, transformOrigin: 'top' })
      .set(mark, { opacity: 1 })
      .to(mark, { opacity: 0, duration: 0.25, delay: 0.1 })
      .to(curtain, { scaleY: 0, duration: 0.6, ease: 'power4.inOut' })
      .set(curtain, { display: 'none' });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const next = new URL(a.href, location.href);
    if (next.origin !== location.origin) return;
    if (next.pathname === location.pathname) return; // якір на тій самій сторінці
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    e.preventDefault();
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* ігноруємо */
    }
    gsap
      .timeline({ onComplete: () => location.assign(next.href) })
      .set(curtain, { display: 'flex', transformOrigin: 'bottom' })
      .fromTo(curtain, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: 'power4.inOut' })
      .fromTo(mark, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.2');
  });

  // Повернення кнопкою «Назад» зі збереженої сторінки (bfcache) — сховати завісу
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) gsap.set(curtain, { display: 'none', scaleY: 0 });
  });
}
