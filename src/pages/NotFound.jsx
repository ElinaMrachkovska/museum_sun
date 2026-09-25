import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="not-found container">
      <h1>404</h1>
      <p>Цю сторінку, здається, знищили в облозі 1672 року.</p>
      <Link to="/" className="btn btn--gold">Повернутися до фортеці</Link>
    </section>
  );
}
