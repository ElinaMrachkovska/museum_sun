import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger, useGSAP } from '../gsap.js';
import VideoBg from '../components/VideoBg.jsx';
import useReveal from '../hooks/useReveal.js';
import { eras, heroVideo, exhibitions } from '../data/eras.js';

const heroTitle = ['Від', 'Русі', 'до', 'України'];

export default function Home() {
  const root = useRef(null);
  const layers = useRef([]);
  const [active, setActive] = useState(0);

  useReveal(root);

  useGSAP(
    () => {
      // --- Банер: поява заголовка по літерах
      gsap
        .timeline({ delay: 0.4 })
        .from('.hero__kicker', { y: 20, opacity: 0 })
        .from('.hero__title .char', { yPercent: 120, rotate: 8, stagger: 0.035, duration: 1.1, ease: 'power4.out' }, '-=0.4')
        .from('.hero__lead', { y: 30, opacity: 0 }, '-=0.6')
        .from('.hero__cta > *', { y: 30, opacity: 0, stagger: 0.1 }, '-=0.6')
        .from('.hero__scroll', { opacity: 0 }, '-=0.3');

      // --- Банер «відпливає» під час скролу
      gsap.to('.hero__content', {
        yPercent: -40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero .video-bg', {
        scale: 1.15,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      // --- Розділи історії: кожна панель перемикає свій відеобанер
      gsap.utils.toArray('.era').forEach((panel, i) => {
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i)
        });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: panel, start: 'top 75%', end: 'top 25%', scrub: 1 }
        });
        tl.from(panel.querySelector('.era__years'), { x: -80, opacity: 0 })
          .from(panel.querySelector('.era__title'), { y: 60, opacity: 0 }, '<0.1')
          .from(panel.querySelector('.era__lead'), { y: 40, opacity: 0 }, '<0.1')
          .from(panel.querySelector('.era__text'), { y: 40, opacity: 0 }, '<0.1')
          .from(panel.querySelectorAll('.era__facts li'), { x: 40, opacity: 0, stagger: 0.1 }, '<0.1');
      });

      // --- Прогрес-лінія хронології
      gsap.fromTo(
        '.timeline__fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.history', start: 'top center', end: 'bottom center', scrub: true }
        }
      );

      // --- Горизонтальна стрічка експозицій (pin)
      const track = root.current.querySelector('.showcase__track');
      const mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', () => {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 80),
          ease: 'none',
          scrollTrigger: {
            trigger: '.showcase',
            start: 'top top',
            end: () => `+=${track.scrollWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true
          }
        });
      });
    },
    { scope: root }
  );

  // Плавна зміна відеобанерів при переході між розділами
  useEffect(() => {
    layers.current.forEach((layer, i) => {
      if (!layer) return;
      const on = i === active;
      gsap.to(layer, {
        opacity: on ? 1 : 0,
        scale: on ? 1 : 1.12,
        filter: on ? 'blur(0px)' : 'blur(8px)',
        duration: 1.2,
        ease: 'power2.inOut',
        overwrite: true
      });
    });
    gsap.fromTo('.history__counter-num', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6 });
  }, [active]);

  const scrollToHistory = () => {
    document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={root} className="home">
      {/* ---------- Відеобанер: середньовічний бій ---------- */}
      <section className="hero">
        <VideoBg src={heroVideo.src} poster={heroVideo.poster} palette={heroVideo.palette} />
        <div className="container hero__content">
          <p className="hero__kicker">Історичний музей · Кам’янець-Подільський</p>
          <h1 className="hero__title" aria-label="Від Русі до України">
            {heroTitle.map((word, wi) => (
              <span className={`hero__word ${wi === 3 ? 'hero__word--accent' : ''}`} key={wi} aria-hidden="true">
                {word.split('').map((ch, ci) => (
                  <span className="char-wrap" key={ci}>
                    <span className="char">{ch}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="hero__lead">
            Тисяча років боротьби, віри й державотворення — від княжих дружин до сучасних захисників.
          </p>
          <div className="hero__cta">
            <Link to="/tickets" className="btn btn--gold">Придбати квиток</Link>
            <button type="button" className="btn btn--ghost" onClick={scrollToHistory}>Почати подорож</button>
          </div>
        </div>
        <button type="button" className="hero__scroll" onClick={scrollToHistory} aria-label="Гортати вниз">
          <span>Гортайте</span>
          <i />
        </button>
      </section>

      {/* ---------- Розділи історії з відеобанерами ---------- */}
      <section className="history" id="history">
        <div className="history__stage" aria-hidden="true">
          {eras.map((era, i) => (
            <VideoBg
              key={era.id}
              ref={(el) => (layers.current[i] = el)}
              className="history__layer"
              src={era.video}
              palette={era.palette}
              playing={i === active}
            />
          ))}
          <div className="timeline" aria-hidden="true">
            <span className="timeline__fill" />
            {eras.map((era, i) => (
              <span key={era.id} className={`timeline__dot ${i <= active ? 'is-passed' : ''} ${i === active ? 'is-current' : ''}`}>
                <em>{era.years}</em>
              </span>
            ))}
          </div>
          <div className="history__counter">
            <span className="history__counter-num">{String(active + 1).padStart(2, '0')}</span>
            <span>/ {String(eras.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="history__panels">
          {eras.map((era) => (
            <article className="era" key={era.id} id={`era-${era.id}`}>
              <div className="container era__inner">
                <p className="era__years">{era.years}</p>
                <h2 className="era__title">{era.title}</h2>
                <p className="era__lead">{era.lead}</p>
                <p className="era__text">{era.text}</p>
                <ul className="era__facts">
                  {era.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Експозиції (горизонтальний скрол) ---------- */}
      <section className="showcase">
        <div className="showcase__head container">
          <p className="section-kicker">Експозиції</p>
          <h2 className="section-title">Зали музею</h2>
        </div>
        <div className="showcase__track">
          {exhibitions.map((ex, i) => (
            <Link to="/exhibitions" className="showcase__card" key={ex.id}>
              <span className="showcase__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="showcase__tag">{ex.tag}</span>
              <h3>{ex.title}</h3>
              <p className="showcase__period">{ex.period}</p>
              <p>{ex.text}</p>
              <span className="showcase__more">Детальніше →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Заклик до дії ---------- */}
      <section className="cta container">
        <div className="cta__box" data-reveal>
          <h2 className="section-title">Станьте частиною історії</h2>
          <p>Зареєструйтеся, щоб отримувати запрошення на нічні екскурсії, реконструкції битв та лекції.</p>
          <div className="cta__actions">
            <Link to="/register" className="btn btn--gold">Зареєструватися</Link>
            <Link to="/reviews" className="btn btn--ghost">Залишити відгук</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
