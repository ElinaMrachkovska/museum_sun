import { gsap, ScrollTrigger, useGSAP } from '../gsap.js';

// Поява елементів з атрибутом data-reveal під час скролу.
export default function useReveal(scope) {
  useGSAP(
    () => {
      const items = gsap.utils.toArray('[data-reveal]');
      items.forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1,
          delay: Number(el.dataset.reveal) || 0,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      });
      ScrollTrigger.refresh();
    },
    { scope }
  );
}
