import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import Field from '../components/Field.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import useForm from '../hooks/useForm.js';
import { tickets } from '../data/eras.js';
import { isEmail, isPhone, isMonday, minLen, todayISO, storage } from '../utils/validators.js';

const times = ['10:00', '11:30', '13:00', '14:30', '16:00'];

const initial = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  payment: 'card',
  agree: false,
  ...Object.fromEntries(tickets.map((t) => [t.id, t.id === 'adult' ? 1 : 0]))
};

const validate = (v) => {
  const e = {};
  if (!minLen(v.name, 2)) e.name = 'Вкажіть ім’я та прізвище';
  if (!isEmail(v.email)) e.email = 'Некоректний e-mail';
  if (!isPhone(v.phone)) e.phone = 'Формат: +380XXXXXXXXX';
  if (!v.date) e.date = 'Оберіть дату візиту';
  else if (v.date < todayISO()) e.date = 'Дата не може бути в минулому';
  else if (isMonday(v.date)) e.date = 'У понеділок музей зачинено';
  if (!v.time) e.time = 'Оберіть час';
  const count = tickets.reduce((s, t) => s + Number(v[t.id] || 0), 0);
  if (count === 0) e.tickets = 'Додайте хоча б один квиток';
  if (!v.agree) e.agree = 'Потрібна згода з правилами відвідування';
  return e;
};

export default function Tickets() {
  const root = useRef(null);
  const totalRef = useRef(null);
  const [order, setOrder] = useState(null);
  const form = useForm(initial, validate);
  const { values, onChange, onBlur, setValue, fieldError, errors } = form;

  const total = tickets.reduce((s, t) => s + t.price * Number(values[t.id] || 0), 0);
  const count = tickets.reduce((s, t) => s + Number(values[t.id] || 0), 0);

  useGSAP(
    () => {
      gsap.from('.ticket-form > *, .ticket-summary', { y: 40, opacity: 0, stagger: 0.08, delay: 0.4 });
    },
    { scope: root }
  );

  useGSAP(() => {
    if (totalRef.current) gsap.fromTo(totalRef.current, { scale: 1.25, color: '#f3d27a' }, { scale: 1, color: '#c9a24a', duration: 0.5 });
  }, { dependencies: [total] });

  const step = (id, delta) => {
    const next = Math.max(0, Math.min(20, Number(values[id]) + delta));
    setValue(id, next);
  };

  const submit = form.handleSubmit((v) => {
    const id = `KP-${Date.now().toString(36).toUpperCase()}`;
    const saved = { id, ...v, total, createdAt: new Date().toISOString() };
    storage.set('museum-orders', [...storage.get('museum-orders', []), saved]);
    setOrder(saved);
  });

  return (
    <div ref={root}>
      <PageHero
        kicker="Квитки"
        title="Придбати квиток"
        text="Оберіть дату, час і кількість квитків — електронний квиток прийде на пошту."
        video="/videos/tickets.mp4"
        palette={['#18120c', '#7a4a1a', '#0a0705']}
      />

      <section className="container section ticket-layout">
        <form className="ticket-form form" onSubmit={submit} noValidate>
          <fieldset className="form__group">
            <legend>1. Квитки</legend>
            {tickets.map((t) => (
              <div className="ticket-row" key={t.id}>
                <div>
                  <p className="ticket-row__label">{t.label}</p>
                  <p className="ticket-row__price">{t.price ? `${t.price} ₴` : 'Безкоштовно'}</p>
                </div>
                <div className="stepper">
                  <button type="button" onClick={() => step(t.id, -1)} aria-label={`Менше: ${t.label}`}>−</button>
                  <output aria-live="polite">{values[t.id]}</output>
                  <button type="button" onClick={() => step(t.id, 1)} aria-label={`Більше: ${t.label}`}>+</button>
                </div>
              </div>
            ))}
            {errors.tickets && <span className="field__error">{errors.tickets}</span>}
          </fieldset>

          <fieldset className="form__group">
            <legend>2. Дата і час</legend>
            <div className="form__row">
              <Field label="Дата візиту" name="date" type="date" min={todayISO()} value={values.date} onChange={onChange} onBlur={onBlur} error={fieldError('date')} />
              <Field label="Час" name="time" as="select" value={values.time} onChange={onChange} onBlur={onBlur} error={fieldError('time')}>
                <option value="">Оберіть сеанс</option>
                {times.map((t) => <option key={t} value={t}>{t}</option>)}
              </Field>
            </div>
          </fieldset>

          <fieldset className="form__group">
            <legend>3. Контакти</legend>
            <Field label="Ім’я та прізвище" name="name" autoComplete="name" value={values.name} onChange={onChange} onBlur={onBlur} error={fieldError('name')} />
            <div className="form__row">
              <Field label="E-mail" name="email" type="email" autoComplete="email" value={values.email} onChange={onChange} onBlur={onBlur} error={fieldError('email')} />
              <Field label="Телефон" name="phone" type="tel" autoComplete="tel" placeholder="+380" value={values.phone} onChange={onChange} onBlur={onBlur} error={fieldError('phone')} />
            </div>
          </fieldset>

          <fieldset className="form__group">
            <legend>4. Оплата</legend>
            <div className="radio-group">
              {[
                ['card', 'Карткою онлайн'],
                ['cash', 'На касі музею']
              ].map(([val, label]) => (
                <label key={val} className={`radio ${values.payment === val ? 'is-checked' : ''}`}>
                  <input type="radio" name="payment" value={val} checked={values.payment === val} onChange={onChange} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <label className={`checkbox ${fieldError('agree') ? 'checkbox--error' : ''}`}>
              <input type="checkbox" name="agree" checked={values.agree} onChange={onChange} onBlur={onBlur} />
              <span>Я погоджуюсь з правилами відвідування музею</span>
            </label>
            <span className="field__error">{fieldError('agree') || ''}</span>
          </fieldset>
        </form>

        <aside className="ticket-summary">
          <div className="ticket-summary__card">
            <p className="section-kicker">Ваше замовлення</p>
            <ul>
              {tickets.filter((t) => values[t.id] > 0).map((t) => (
                <li key={t.id}>
                  <span>{t.label} × {values[t.id]}</span>
                  <span>{t.price * values[t.id]} ₴</span>
                </li>
              ))}
              {count === 0 && <li className="muted">Квитки не обрано</li>}
            </ul>
            <p className="ticket-summary__meta">
              {values.date || 'Дата —'} · {values.time || 'час —'}
            </p>
            <p className="ticket-summary__total">
              Разом: <strong ref={totalRef}>{total} ₴</strong>
            </p>
            <button type="button" className="btn btn--gold btn--block" onClick={() => document.querySelector('.ticket-form').requestSubmit()}>
              {values.payment === 'card' ? 'Оплатити' : 'Забронювати'}
            </button>
          </div>
        </aside>
      </section>

      <SuccessModal open={!!order} title="Квиток оформлено!" onClose={() => { setOrder(null); form.reset(); }}>
        {order && (
          <>
            <p>Номер замовлення: <strong>{order.id}</strong></p>
            <p>{order.date} о {order.time} · {order.total} ₴</p>
            <p className="muted">Підтвердження надіслано на {order.email}</p>
          </>
        )}
      </SuccessModal>
    </div>
  );
}
