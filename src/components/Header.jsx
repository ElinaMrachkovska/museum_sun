import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { gsap, useGSAP } from '../gsap.js';

const links = [
  { to: '/', label: 'Головна' },
  { to: '/about', label: 'Про музей' },
  { to: '/exhibitions', label: 'Експозиції' },
  { to: '/reviews', label: 'Відгуки' },
  { to: '/contacts', label: 'Контакти' }
];

export default function Header() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useGSAP(
    () => {
      gsap.from('.header__logo, .nav__link, .header__actions > *', {
        y: -30,
        opacity: 0,
        stagger: 0.06,
        duration: 0.9,
        delay: 0.2
      });
    },
    { scope: ref }
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    if (open) {
      gsap.fromTo(
        '.nav--mobile .nav__link',
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.07, duration: 0.6, delay: 0.15 }
      );
    }
  }, [open]);

  const navItems = (cls) =>
    links.map((l) => (
      <NavLink key={l.to} to={l.to} end className={({ isActive }) => `nav__link link-fx ${isActive ? 'is-active' : ''} ${cls}`}>
        {l.label}
      </NavLink>
    ));

  return (
    <header ref={ref} className={`header ${scrolled ? 'header--scrolled' : ''} ${open ? 'header--open' : ''}`}>
      <Link to="/" className="header__logo" aria-label="На головну">
        <svg viewBox="0 0 64 64" width="38" height="38" aria-hidden="true">
          <path d="M32 6l6 14h-4v10l8-6v8l-8 6v10h6l-8 6-8-6h6V38l-8-6v-8l8 6V20h-4z" fill="currentColor" />
        </svg>
        <span>
          <strong>Від Русі</strong>
          <em>до України</em>
        </span>
      </Link>

      <nav className="nav nav--desktop" aria-label="Головне меню">
        {navItems('')}
      </nav>

      <div className="header__actions">
        <Link to="/register" className="link-fx header__login">Реєстрація</Link>
        <Link to="/tickets" className="btn btn--gold btn--sm">Квитки</Link>
        <button
          type="button"
          className={`burger ${open ? 'is-open' : ''}`}
          aria-label="Меню"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className="mobile-menu" aria-hidden={!open}>
        <nav className="nav nav--mobile">
          {navItems('')}
          <NavLink to="/register" className="nav__link link-fx">Реєстрація</NavLink>
          <NavLink to="/tickets" className="nav__link link-fx">Придбати квиток</NavLink>
        </nav>
      </div>
    </header>
  );
}
