import Link from '../components/Link.jsx';
import { openingHours, contacts, tel } from '../data/prices.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__brand">Від Русі до України</p>
          <p className="footer__muted">Кам’янець крізь віки<br />{contacts.address}</p>
          <p className="socials">
            {contacts.socials.map((s) => (
              <a key={s.label} className="link-fx" href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
            ))}
          </p>
        </div>
        <div>
          <p className="footer__title">Відвідувачам</p>
          <Link className="link-fx" to="/tickets">Квитки</Link>
          <Link className="link-fx" to="/exhibitions">Експозиції</Link>
          <Link className="link-fx" to="/gallery">Фотогалерея</Link>
          <Link className="link-fx" to="/register">Реєстрація</Link>
        </div>
        <div>
          <p className="footer__title">Музей</p>
          <Link className="link-fx" to="/about">Про музей</Link>
          <Link className="link-fx" to="/reviews">Відгуки та пропозиції</Link>
          <Link className="link-fx" to="/contacts">Зворотний зв’язок</Link>
        </div>
        <div>
          <p className="footer__title">Години роботи</p>
          <p className="footer__muted">{openingHours}</p>
          <a className="link-fx" href={tel(contacts.phone)}>{contacts.phone}</a>
          <a className="link-fx" href={`mailto:${contacts.email}`}>{contacts.email}</a>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Музей «{contacts.name}»</span>
        <span>Слава Україні!</span>
      </div>
    </footer>
  );
}
