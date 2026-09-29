import { useRef } from 'react';
import Link from '../components/Link.jsx';
import { gsap, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import { eras } from '../data/eras.js';
import { url } from '../utils/url.js';

// Зали музею — 8 держав на теренах України (за «паспортом» музею)
export default function Exhibitions() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.utils.toArray('.hall').forEach((hall) => {
        gsap.from(hall.querySelector('.hall__photo'), {
          clipPath: 'inset(0% 100% 0% 0%)',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: { trigger: hall, start: 'top 80%', once: true }
        });
        gsap.from(hall.querySelectorAll('.hall__body > *'), {
          y: 30,
          opacity: 0,
          stagger: 0.08,
          scrollTrigger: { trigger: hall, start: 'top 75%', once: true }
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <PageHero
        kicker="Експозиції"
        title="Вісім держав — одна історія"
        text="Зали музею ведуть від Русі до сучасної України: кожна держава — окрема глава з реалістичними фігурами, діорамами та аудіогідом."
        image="/gallery/volodymyr-velykyi.jpg"
        palette={['#161310', '#6a3b1b', '#0a0806']}
      />

      <nav className="container halls-nav" aria-label="Зали музею">
        {eras.map((h, i) => (
          <a key={h.id} href={`#${h.id}`} className="chip">
            {String(i + 1).padStart(2, '0')} · {h.title}
          </a>
        ))}
      </nav>

      <section className="container section halls">
        {eras.map((h, i) => (
          <article className={`hall ${i % 2 ? 'hall--reverse' : ''}`} key={h.id} id={h.id}>
            <div className="hall__photo">
              <img src={url(h.photo)} alt={`Зал «${h.title}»`} loading="lazy" decoding="async" />
              <span className="hall__num">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="hall__body">
              <p className="hall__years">
                {h.years} <span>· тривалість: {h.duration}</span>
              </p>
              <h2 className="hall__title">{h.title}</h2>
              <blockquote className="hall__motto">
                <p>«{h.motto}»</p>
                <cite>{h.figure}</cite>
              </blockquote>
              <p className="hall__text">{h.text}</p>
              <ul className="hall__facts">
                {h.facts.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </article>
        ))}

        <div className="halls__cta">
          <Link to="/tickets" className="btn btn--gold">Придбати квиток</Link>
          <Link to="/gallery" className="btn btn--ghost">Фотогалерея</Link>
        </div>
      </section>
    </div>
  );
}
