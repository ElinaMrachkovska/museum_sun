import { useEffect } from 'react';
import { gsap } from '../gsap.js';

// Глобальна GSAP-анімація для ВСІХ активних кнопок і посилань:
// підйом при наведенні, «магнітний» ефект для .btn, хвиля (ripple) при кліку.
const SELECTOR = 'a, button, .btn, [role="button"]';

export default function useInteractiveFx() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const onOver = (e) => {
      const el = e.target.closest(SELECTOR);
      if (!el || el.disabled || el.contains(e.relatedTarget)) return;
      gsap.to(el, { y: -2, scale: el.classList.contains('btn') ? 1.04 : 1, duration: 0.35 });
    };

    const onOut = (e) => {
      const el = e.target.closest(SELECTOR);
      if (!el || el.contains(e.relatedTarget)) return;
      gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    };

    const onMove = (e) => {
      const el = e.target.closest('.btn');
      if (!el || el.disabled) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      gsap.to(el, { x, y: y - 2, duration: 0.4 });
    };

    const onDown = (e) => {
      const el = e.target.closest(SELECTOR);
      if (!el || el.disabled) return;
      gsap.fromTo(el, { scale: 0.95 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
      if (!el.classList.contains('btn')) return;
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
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerdown', onDown);
    };
  }, []);
}
