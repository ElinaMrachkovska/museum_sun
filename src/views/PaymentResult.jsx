import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../gsap.js';
import Link from '../components/Link.jsx';
import { api } from '../utils/api.js';

// Сторінка, на яку LiqPay / Monobank повертають відвідувача після оплати.
// Статус перевіряється на сервері (браузеру про «успіх» не віримо).
const STATES = {
  loading: { icon: '…', title: 'Перевіряємо оплату', text: 'Це займе кілька секунд.' },
  pending: { icon: '⏳', title: 'Оплата обробляється', text: 'Банк ще підтверджує платіж. Сторінка оновиться автоматично.' },
  paid: { icon: '✓', title: 'Оплату отримано!', text: 'Квитки оплачено. Збережіть номер замовлення — його треба назвати на вході до музею.' },
  reserved: { icon: '✓', title: 'Квитки заброньовано', text: 'Оплатіть їх на касі музею, назвавши номер замовлення.' },
  failed: { icon: '✕', title: 'Оплата не пройшла', text: 'Гроші не списано. Спробуйте ще раз або оберіть інший спосіб оплати.' },
  refunded: { icon: '↩', title: 'Кошти повернено', text: 'Платіж за цим замовленням скасовано.' },
  notfound: { icon: '?', title: 'Замовлення не знайдено', text: 'Перевірте посилання або зверніться до музею.' },
  error: { icon: '!', title: 'Не вдалося перевірити оплату', text: '' }
};

const POLL_MS = 3000;
const MAX_POLLS = 40; // ~2 хвилини

export default function PaymentResult() {
  const root = useRef(null);
  const [state, setState] = useState('loading');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('order');
    if (!id) {
      setState('notfound');
      return undefined;
    }
    let polls = 0;
    let timer;
    let stopped = false;

    const check = async () => {
      try {
        const { order: o } = await api(`/api/orders/${encodeURIComponent(id)}`);
        if (stopped) return;
        setOrder(o);
        setState(o.status);
        if (o.status === 'pending' && ++polls < MAX_POLLS) timer = setTimeout(check, POLL_MS);
      } catch (e) {
        if (stopped) return;
        if (e.status === 404) setState('notfound');
        else {
          setError(e.message);
          setState('error');
        }
      }
    };
    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);

  useGSAP(
    () => {
      gsap.fromTo('.result__icon', { scale: 0, rotate: -120 }, { scale: 1, rotate: 0, ease: 'back.out(2)', duration: 0.8 });
      gsap.fromTo('.result__body > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, delay: 0.2 });
    },
    { scope: root, dependencies: [state] }
  );

  const s = STATES[state] || STATES.error;

  return (
    <section ref={root} className={`result result--${state} container`}>
      <div className="result__card">
        <div className="result__icon" aria-hidden="true">{s.icon}</div>
        <div className="result__body" aria-live="polite">
          <h1 className="result__title">{s.title}</h1>
          <p className="muted">{error || s.text}</p>
          {order && (
            <dl className="result__details">
              <div><dt>Номер замовлення</dt><dd>{order.id}</dd></div>
              <div><dt>Візит</dt><dd>{order.date} о {order.time}</dd></div>
              <div><dt>Квитки</dt><dd>{order.items.map((i) => `${i.label} × ${i.qty}`).join(', ')}</dd></div>
              <div><dt>Сума</dt><dd>{order.total} ₴</dd></div>
              <div><dt>E-mail</dt><dd>{order.email}</dd></div>
            </dl>
          )}
          <div className="result__actions">
            {state === 'failed' && <Link to="/tickets" className="btn btn--gold">Спробувати ще раз</Link>}
            <Link to="/" className={`btn ${state === 'failed' ? 'btn--ghost' : 'btn--gold'}`}>На головну</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
