import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import { exhibitions } from '../data/eras.js';

const filters = ['Усі', 'Постійна', 'Тимчасова', 'Нова'];

export default function Exhibitions() {
  const root = useRef(null);
  const [filter, setFilter] = useState('Усі');
  const list = useMemo(
    () => (filter === 'Усі' ? exhibitions : exhibitions.filter((e) => e.tag === filter)),
    [filter]
  );

  useGSAP(
    () => {
      gsap.from('.ex-card', { y: 60, opacity: 0, stagger: 0.08, duration: 0.7 });
    },
    { scope: root, dependencies: [filter] }
  );

  // 3D-нахил картки за курсором
  const tilt = (e) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
    gsap.to(card, { rotateX: rx, rotateY: ry, transformPerspective: 800, duration: 0.4 });
  };
  const untilt = (e) => gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });

  return (
    <div ref={root}>
      <PageHero
        kicker="Експозиції"
        title="Зали, що говорять"
        text="Сім залів — сім епох. Оберіть, з чого почати."
        video="/videos/exhibitions.mp4"
        palette={['#161310', '#6a3b1b', '#0a0806']}
      />

      <section className="container section">
        <div className="filters" role="tablist">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={`chip ${filter === f ? 'is-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ex-grid">
          {list.map((ex, i) => (
            <article className="ex-card" key={ex.id} onMouseMove={tilt} onMouseLeave={untilt}>
              <div className="ex-card__art" style={{ '--h': `${(i * 37) % 60}deg` }}>
                <span>{ex.title.charAt(0)}</span>
              </div>
              <div className="ex-card__body">
                <span className="ex-card__tag">{ex.tag}</span>
                <h3>{ex.title}</h3>
                <p className="ex-card__period">{ex.period}</p>
                <p>{ex.text}</p>
                <Link to="/tickets" className="link-fx link-arrow">Відвідати →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
