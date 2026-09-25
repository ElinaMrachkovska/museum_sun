import { useRef } from 'react';
import { gsap, useGSAP } from '../gsap.js';
import VideoBg from './VideoBg.jsx';

// Банер внутрішніх сторінок з відеофоном та анімацією заголовка.
export default function PageHero({ kicker, title, text, video, palette }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap
        .timeline({ delay: 0.3 })
        .from('.page-hero__kicker', { y: 20, opacity: 0 })
        .from('.page-hero__title .word', { yPercent: 110, stagger: 0.08, duration: 1 }, '-=0.5')
        .from('.page-hero__text', { y: 20, opacity: 0 }, '-=0.6');

      gsap.to('.video-bg', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true }
      });
    },
    { scope: ref }
  );

  return (
    <section ref={ref} className="page-hero">
      <VideoBg src={video} palette={palette} />
      <div className="container page-hero__content">
        <p className="page-hero__kicker">{kicker}</p>
        <h1 className="page-hero__title">
          {title.split(' ').map((w, i) => (
            <span className="word-wrap" key={i}>
              <span className="word">{w}&nbsp;</span>
            </span>
          ))}
        </h1>
        {text && <p className="page-hero__text">{text}</p>}
      </div>
    </section>
  );
}
