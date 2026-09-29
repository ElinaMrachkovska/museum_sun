import { gsap } from '../gsap.js';

// Глобальна GSAP-анімація для ВСІХ активних кнопок і посилань — без зміщення елементів:
// кнопки при наведенні м’яко «світяться» (колір і заливку змінює Sass),
// при кліку по кнопці розходиться хвиля (ripple).
const SELECTOR = 'a, button, .btn, [role="button"]';
const GLOW = {
  gold: '0 0 0 1px rgba(243, 210, 122, 0.55), 0 14px 38px -10px rgba(201, 162, 74, 0.95)',
  default: '0 0 0 1px rgba(236, 227, 210, 0.35), 0 10px 30px -12px rgba(236, 227, 210, 0.45)'
};

export default function initInteractiveFx() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onOver = (e) => {
    const el = e.target.closest('.btn');
    if (!el || el.disabled || el.contains(e.relatedTarget)) return;
    gsap.to(el, {
      boxShadow: el.classList.contains('btn--gold') ? GLOW.gold : GLOW.default,
      duration: reduced ? 0 : 0.4,
      ease: 'power2.out'
    });
  };

  const onOut = (e) => {
    const el = e.target.closest('.btn');
    if (!el || el.contains(e.relatedTarget)) return;
    // повертаємо тінь зі стилів Sass
    gsap.to(el, { boxShadow: '', duration: reduced ? 0 : 0.5, ease: 'power2.out', clearProps: 'boxShadow' });
  };

  const onDown = (e) => {
    const el = e.target.closest(SELECTOR);
    if (!el || el.disabled || reduced || !el.classList.contains('btn')) return;
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    Object.assign(ripple.style, {
      width: `${size}px`,
      height: `${size}px`,
      left: `${e.clientX - r.left - size / 2}px`,
      top: `${e.clientY - r.top - size / 2}px`
    });
    el.appendChild(ripple);
    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 0.45 },
      { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() }
    );
  };

  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onOut);
  document.addEventListener('pointerdown', onDown);
}
