import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import { photos, videos, categoryOrder } from '../data/gallery.js';
import { url } from '../utils/url.js';

// Форма плитки в мозаїці залежно від пропорцій фото
const tileShape = ({ width, height }) => {
  const r = width / height;
  if (r >= 1.6) return 'wide';
  if (r <= 0.8) return 'tall';
  return 'square';
};

export default function Gallery() {
  const root = useRef(null);
  const boxRef = useRef(null);
  const [filter, setFilter] = useState('Усі');
  const [open, setOpen] = useState(-1); // індекс відкритого фото
  const [video, setVideo] = useState(-1); // індекс відкритого відео
  const videoBoxRef = useRef(null);
  const touch = useRef(null);

  const categories = useMemo(() => {
    const present = new Set(photos.map((p) => p.category).filter(Boolean));
    return ['Усі', ...categoryOrder.filter((c) => present.has(c)), ...[...present].filter((c) => !categoryOrder.includes(c))];
  }, []);
  const list = useMemo(() => (filter === 'Усі' ? photos : photos.filter((p) => p.category === filter)), [filter]);

  // Поява плиток під час скролу: «шторка» відкриває фото
  useGSAP(
    () => {
      gsap.utils.toArray('.tile').forEach((tile, i) => {
        gsap.fromTo(
          tile,
          { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0.4 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            duration: 1.1,
            ease: 'power4.out',
            delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: tile, start: 'top 92%', once: true }
          }
        );
      });
      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [filter] }
  );

  const close = useCallback(() => {
    const box = boxRef.current;
    if (!box) return setOpen(-1);
    gsap.to(box, { opacity: 0, duration: 0.3, onComplete: () => setOpen(-1) });
  }, []);

  const go = useCallback(
    (dir) => {
      setOpen((i) => (i + dir + list.length) % list.length);
      const img = boxRef.current?.querySelector('.lightbox__img');
      if (img) gsap.fromTo(img, { opacity: 0, x: dir * 60 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
    },
    [list.length]
  );

  // Відкриття переглядача: блокування скролу, клавіатура
  useEffect(() => {
    if (open < 0) return undefined;
    document.body.classList.add('no-scroll');
    const box = boxRef.current;
    gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo(box.querySelector('.lightbox__figure'), { scale: 0.92, y: 20 }, { scale: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    box.querySelector('.lightbox__close')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [open >= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Перегляд відео: зі звуком, закриття Esc
  const closeVideo = useCallback(() => {
    const box = videoBoxRef.current;
    box?.querySelector('video')?.pause();
    if (!box) return setVideo(-1);
    gsap.to(box, { opacity: 0, duration: 0.3, onComplete: () => setVideo(-1) });
  }, []);

  useEffect(() => {
    if (video < 0) return undefined;
    document.body.classList.add('no-scroll');
    const box = videoBoxRef.current;
    gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo(box.querySelector('.lightbox__figure'), { scale: 0.92, y: 20 }, { scale: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    box.querySelector('.lightbox__close')?.focus();
    const onKey = (e) => e.key === 'Escape' && closeVideo();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [video >= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // Свайп на телефоні
  const onTouchStart = (e) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  const current = list[open];

  return (
    <div ref={root}>
      <PageHero
        kicker="Фотогалерея"
        title="Музей у кадрі"
        text="Зали, експонати й події музею — погляньте, що чекає на вас у Кам’янці."
        image="/gallery/obloha-1672.jpg"
        palette={['#161310', '#5a3d1e', '#0a0806']}
      />

      <section className="container section gallery">
        {photos.length === 0 ? (
          <div className="gallery__empty">
            <p className="section-kicker">Незабаром</p>
            <h2 className="section-title">Фотографії з’являться найближчим часом</h2>
            <p className="muted">Ми готуємо добірку світлин із залів музею.</p>
          </div>
        ) : (
          <>
            <div className="gallery__head">
              <p className="gallery__count">
                <strong>{String(photos.length).padStart(2, '0')}</strong> фото
                {videos.length > 0 && <> · <strong>{String(videos.length).padStart(2, '0')}</strong> відео</>}
              </p>
            </div>

            {videos.length > 0 && (
              <div className="reels">
                <h2 className="reels__title">Відео</h2>
                <div className="reels__track">
                  {videos.map((v, i) => (
                    <button key={v.src} type="button" className="reel" onClick={() => setVideo(i)} aria-label={`Дивитися відео: ${v.title}`}>
                      <img src={url(v.poster)} alt="" width={v.width} height={v.height} loading="lazy" decoding="async" />
                      <span className="reel__play" aria-hidden="true">▶</span>
                      <span className="reel__meta">
                        <strong>{v.title}</strong>
                        <em>{v.duration}</em>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="gallery__photos-head">
              <h2 className="reels__title">Фото</h2>
              {categories.length > 2 && (
                <div className="filters" role="tablist">
                  {categories.map((c) => (
                    <button key={c} type="button" role="tab" aria-selected={filter === c} className={`chip ${filter === c ? 'is-active' : ''}`} onClick={() => setFilter(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mosaic">
              {list.map((p, i) => (
                <button key={p.src} type="button" className={`tile tile--${tileShape(p)}`} onClick={() => setOpen(i)} aria-label={`Відкрити фото: ${p.alt}`}>
                  <img src={url(p.thumb || p.src)} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" />
                  {(p.caption || p.category) && (
                    <span className="tile__caption">
                      {p.category && <em>{p.category}</em>}
                      {p.caption}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {video >= 0 && (
        <div ref={videoBoxRef} className="lightbox lightbox--video" role="dialog" aria-modal="true" aria-label={videos[video].title} onClick={(e) => e.target === e.currentTarget && closeVideo()}>
          <button type="button" className="lightbox__close" onClick={closeVideo} aria-label="Закрити">✕</button>
          <figure className="lightbox__figure">
            <video className="lightbox__img" src={url(videos[video].src)} poster={url(videos[video].poster)} width={videos[video].width} height={videos[video].height} controls autoPlay playsInline />
            <figcaption className="lightbox__caption">
              <span>{videos[video].title}</span>
              <span className="lightbox__counter">{videos[video].duration}</span>
            </figcaption>
          </figure>
        </div>
      )}

      {current && (
        <div ref={boxRef} className="lightbox" role="dialog" aria-modal="true" aria-label={current.alt} onClick={(e) => e.target === e.currentTarget && close()} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button type="button" className="lightbox__close" onClick={close} aria-label="Закрити">✕</button>
          {list.length > 1 && (
            <>
              <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Попереднє фото">←</button>
              <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Наступне фото">→</button>
            </>
          )}
          <figure className="lightbox__figure">
            <img className="lightbox__img" src={url(current.src)} alt={current.alt} width={current.width} height={current.height} />
            <figcaption className="lightbox__caption">
              <span>{current.caption || current.alt}</span>
              <span className="lightbox__counter">{String(open + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
