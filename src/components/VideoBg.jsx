import { forwardRef, useEffect, useRef, useState } from 'react';

// Додає базовий шлях сайту (для GitHub Pages: /museum_sun/) до шляхів з public/
const withBase = (path) => (path?.startsWith('/') ? import.meta.env.BASE_URL + path.slice(1) : path);

// Відеофон. Якщо файлу немає або він не завантажився —
// показується анімований «вогняний» фон у кольорах розділу.
const VideoBg = forwardRef(function VideoBg({ src, poster, palette = [], playing = true, className = '' }, ref) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);

  // Грає лише тоді, коли активне й видиме на екрані (економить ресурси)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || failed) return undefined;
    if (!playing) {
      v.pause();
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [playing, failed]);

  const [c1 = '#1a1410', c2 = '#6b2d17', c3 = '#0b0907'] = palette;

  return (
    <div
      ref={ref}
      className={`video-bg ${failed ? 'video-bg--fallback' : ''} ${className}`}
      style={{ '--c1': c1, '--c2': c2, '--c3': c3 }}
    >
      {!failed && (
        <video
          ref={videoRef}
          className="video-bg__video"
          src={withBase(src)}
          poster={withBase(poster)}
          muted
          loop
          playsInline
          autoPlay={playing}
          preload="metadata"
          onError={() => setFailed(true)}
        />
      )}
      <div className="video-bg__fallback" aria-hidden="true">
        <span className="video-bg__glow" />
        <span className="video-bg__embers" />
      </div>
      <div className="video-bg__shade" />
    </div>
  );
});

export default VideoBg;
