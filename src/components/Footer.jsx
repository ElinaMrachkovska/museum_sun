import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__brand">Від Русі до України</p>
          <p className="footer__muted">Історичний музей<br />м. Кам’янець-Подільський</p>
        </div>
        <div>
          <p className="footer__title">Відвідувачам</p>
          <Link className="link-fx" to="/tickets">Квитки</Link>
          <Link className="link-fx" to="/exhibitions">Експозиції</Link>
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
          <p className="footer__muted">Вт – Нд: 10:00 – 18:00<br />Пн — вихідний</p>
          <a className="link-fx" href="tel:+380380000000">+38 (038) 000-00-00</a>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Музей «Від Русі до України»</span>
        <span>Слава Україні!</span>
      </div>
    </footer>
  );
}
