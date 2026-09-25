import { useEffect, useRef } from 'react';
import { gsap } from '../gsap.js';

export default function SuccessModal({ open, title, children, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const el = ref.current;
    gsap
      .timeline()
      .fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      .fromTo(el.querySelector('.modal__box'), { y: 60, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.6)' }, '-=0.1')
      .fromTo(el.querySelector('.modal__seal'), { rotate: -180, scale: 0 }, { rotate: 0, scale: 1, ease: 'back.out(2)' }, '-=0.5');
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    el.querySelector('.btn')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" ref={ref} role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__box">
        <div className="modal__seal" aria-hidden="true">✓</div>
        <h3 className="modal__title">{title}</h3>
        <div className="modal__body">{children}</div>
        <button type="button" className="btn btn--gold" onClick={onClose}>Добре</button>
      </div>
    </div>
  );
}
