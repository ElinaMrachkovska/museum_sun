import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger } from './gsap.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import useInteractiveFx from './hooks/useInteractiveFx.js';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Exhibitions from './pages/Exhibitions.jsx';
import Tickets from './pages/Tickets.jsx';
import Register from './pages/Register.jsx';
import Contacts from './pages/Contacts.jsx';
import Reviews from './pages/Reviews.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const curtainRef = useRef(null);
  const firstRender = useRef(true);

  useInteractiveFx();

  // Перехід між сторінками: «завіса» закриває екран, змінюємо маршрут, відкриваємо.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (location.pathname === displayLocation.pathname) {
      setDisplayLocation(location);
      return;
    }
    const curtain = curtainRef.current;
    const tl = gsap.timeline();
    tl.set(curtain, { transformOrigin: 'bottom', display: 'flex' })
      .fromTo(curtain, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: 'power4.inOut' })
      .fromTo(curtain.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, '-=0.2')
      .add(() => {
        setDisplayLocation(location);
        window.scrollTo(0, 0);
      })
      .to(curtain.children, { opacity: 0, duration: 0.2 }, '+=0.15')
      .set(curtain, { transformOrigin: 'top' })
      .to(curtain, { scaleY: 0, duration: 0.6, ease: 'power4.inOut' })
      .set(curtain, { display: 'none' })
      .add(() => ScrollTrigger.refresh());
    return () => tl.kill();
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header />
      <main className="main">
        <Routes location={displayLocation}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/exhibitions" element={<Exhibitions />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <div className="curtain" ref={curtainRef} aria-hidden="true">
        <span className="curtain__mark">Від Русі до України</span>
      </div>
    </>
  );
}
