import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import Field from '../components/Field.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import useForm from '../hooks/useForm.js';
import { tickets, sessionTimes as times } from '../data/prices.js';
import { isEmail, isPhone, minLen, todayISO, isLastTuesday, nextLastTuesday, formatDate } from '../utils/validators.js';
import { api, goToPayment } from '../utils/api.js';

const paymentOptions = [
  { id: 'liqpay', label: 'LiqPay', hint: 'картка, Apple Pay, Google Pay, Приват24' },
  { id: 'monobank', label: 'Monobank', hint: 'картка, Apple Pay, Google Pay' },
  { id: 'cash', label: 'На касі музею', hint: 'бронювання без оплати онлайн' }
];

const initial = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  payment: 'liqpay',
  agree: false,
  ...Object.fromEntries(tickets.map((t) => [t.id, t.id === 'full' ? 1 : 0]))
};

const validate = (v) => {
  const e = {};
  if (!minLen(v.name, 2)) e.name = 'Вкажіть ім’я та прізвище';
  if (!isEmail(v.email)) e.email = 'Некоректний e-mail';
  if (!isPhone(v.phone)) e.phone = 'Формат: +380XXXXXXXXX';
  if (!v.date) e.date = 'Оберіть дату візиту';
  else if (v.date < todayISO()) e.date = 'Дата не може бути в минулому';
  if (!v.time) e.time = 'Оберіть час';
  const count = tickets.reduce((s, t) => s + Number(v[t.id] || 0), 0);
  if (count === 0) e.tickets = 'Додайте хоча б один квиток';
  else if (tickets.some((t) => t.lastTuesdayOnly && v[t.id] > 0) && !isLastTuesday(v.date)) {
    e.tickets = 'Соціальний квиток діє лише в останній вівторок місяця';
  }
  if (!v.agree) e.agree = 'Потрібна згода з правилами відвідування';
  return e;
};

export default function Tickets() {
  const root = useRef(null);
  const totalRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [methods, setMethods] = useState(null); // які способи оплати налаштовані на сервері
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const form = useForm(initial, validate);
  const { values, onChange, onBlur, setValue, fieldError, errors } = form;

  const total = tickets.reduce((s, t) => s + t.price * Number(values[t.id] || 0), 0);
  const count = tickets.reduce((s, t) => s + Number(values[t.id] || 0), 0);
  const lastTuesday = isLastTuesday(values.date);
  const nearestLastTuesday = nextLastTuesday();

  // Дата змінилася і вже не останній вівторок — прибираємо соціальні квитки
  useEffect(() => {
    if (lastTuesday) return;
    tickets.filter((t) => t.lastTuesdayOnly && values[t.id] > 0).forEach((t) => setValue(t.id, 0));
  }, [lastTuesday]); // eslint-disable-line react-hooks/exhaustive-deps

  useGSAP(
    () => {
      gsap.from('.ticket-form > *, .ticket-summary', { y: 40, opacity: 0, stagger: 0.08, delay: 0.4 });
    },
    { scope: root }
  );

  useGSAP(() => {
    if (totalRef.current) gsap.fromTo(totalRef.current, { scale: 1.25, color: '#f3d27a' }, { scale: 1, color: '#c9a24a', duration: 0.5 });
  }, { dependencies: [total] });

  useEffect(() => {
    api('/api/payments/methods')
      .then((m) => {
        setMethods(m);
        const first = paymentOptions.find((o) => m[o.id]);
        if (first && !m[form.values.payment]) setValue('payment', first.id);
      })
      .catch((e) => setServerError(e.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const step = (id, delta) => {
    const next = Math.max(0, Math.min(20, Number(values[id]) + delta));
    setValue(id, next);
  };

  const submit = form.handleSubmit(async (v) => {
    setSending(true);
    setServerError('');
    try {
      const res = await api('/api/orders', {
        method: 'POST',
        body: {
          tickets: Object.fromEntries(tickets.map((t) => [t.id, Number(v[t.id]) || 0])),
          date: v.date,
          time: v.time,
          name: v.name,
          email: v.email,
          phone: v.phone,
          payment: v.payment,
          agree: v.agree
        }
      });
      if (res.redirect) {
        goToPayment(res.redirect); // перехід на сторінку LiqPay / Monobank
        return;
      }
      setOrder(res.order);
    } catch (e) {
      form.applyServerErrors(e.fields);
      setServerError(Object.keys(e.fields || {}).length ? 'Перевірте виділені поля' : e.message);
    }
    setSending(false);
  });

  const payOnline = values.payment !== 'cash' && total > 0;

  return (
    <div ref={root}>
      <PageHero
        kicker="Квитки"
        title="Придбати квиток"
        text="Оберіть дату, час і кількість квитків та оплатіть онлайн або на касі музею."
        video="/videos/tickets.mp4"
        palette={['#18120c', '#7a4a1a', '#0a0705']}
      />

      <section className="container section prices">
        <p className="section-kicker">Вартість</p>
        <h2 className="section-title">Ціни на квитки</h2>
        <div className="prices__grid">
          {tickets.map((t) => (
            <article key={t.id} className={`price-card ${t.lastTuesdayOnly ? 'price-card--social' : ''}`}>
              <h3 className="price-card__label">{t.label}</h3>
              <p className="price-card__price">{t.price}<span> ₴</span></p>
              <p className="price-card__note">{t.note}</p>
              {t.categories && (
                <ul className="price-card__list">
                  {t.categories.map((c) => <li key={c}>{c}</li>)}
                </ul>
              )}
              {t.lastTuesdayOnly && nearestLastTuesday && (
                <p className="price-card__date">Найближчий: <strong>{formatDate(nearestLastTuesday)}</strong></p>
              )}
            </article>
          ))}
        </div>
        <p className="prices__hint">Пільгові та соціальні квитки надаються за умови пред’явлення документа, що підтверджує право на пільгу.</p>
      </section>

      <section className="container section ticket-layout">
        <form className="ticket-form form" onSubmit={submit} noValidate>
          <fieldset className="form__group">
            <legend>1. Квитки</legend>
            {tickets.map((t) => {
              const locked = t.lastTuesdayOnly && !lastTuesday;
              return (
                <div className={`ticket-row ${locked ? 'is-locked' : ''}`} key={t.id}>
                  <div>
                    <p className="ticket-row__label">{t.label}</p>
                    <p className="ticket-row__price">{t.price} ₴</p>
                    <p className="ticket-row__note">
                      {locked && nearestLastTuesday ? (
                        <>
                          Лише в останній вівторок місяця.{' '}
                          <button type="button" className="link-fx ticket-row__pick" onClick={() => setValue('date', nearestLastTuesday)}>
                            Обрати {formatDate(nearestLastTuesday)}
                          </button>
                        </>
                      ) : (
                        t.note
                      )}
                    </p>
                  </div>
                  <div className="stepper">
                    <button type="button" onClick={() => step(t.id, -1)} disabled={locked} aria-label={`Менше: ${t.label}`}>−</button>
                    <output aria-live="polite">{values[t.id]}</output>
                    <button type="button" onClick={() => step(t.id, 1)} disabled={locked} aria-label={`Більше: ${t.label}`}>+</button>
                  </div>
                </div>
              );
            })}
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
            <div className="radio-group radio-group--stack">
              {paymentOptions.map((o) => {
                const unavailable = methods !== null && !methods[o.id];
                return (
                  <label key={o.id} className={`radio radio--pay ${values.payment === o.id ? 'is-checked' : ''} ${unavailable ? 'is-disabled' : ''}`}>
                    <input type="radio" name="payment" value={o.id} checked={values.payment === o.id} onChange={onChange} disabled={unavailable} />
                    <span className={`pay-logo pay-logo--${o.id}`} aria-hidden="true" />
                    <span>
                      <strong>{o.label}</strong>
                      <small>{unavailable ? 'тимчасово недоступно' : o.hint}</small>
                    </span>
                  </label>
                );
              })}
            </div>
            <span className="field__error">{fieldError('payment') || ''}</span>
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
            {serverError && <p className="form-alert" role="alert">{serverError}</p>}
            <button
              type="button"
              className="btn btn--gold btn--block"
              disabled={sending}
              onClick={() => document.querySelector('.ticket-form').requestSubmit()}
            >
              {sending ? 'Зачекайте…' : payOnline ? `Оплатити ${total} ₴` : 'Забронювати'}
            </button>
            {payOnline && <p className="ticket-summary__note">Оплата відбувається на захищеній сторінці {values.payment === 'liqpay' ? 'LiqPay' : 'Monobank'}. Дані картки не потрапляють на сайт музею.</p>}
          </div>
        </aside>
      </section>

      <SuccessModal open={!!order} title="Квитки заброньовано!" onClose={() => { setOrder(null); form.reset(); }}>
        {order && (
          <>
            <p>Номер замовлення: <strong>{order.id}</strong></p>
            <p>{order.date} о {order.time} · {order.total} ₴</p>
            <p className="muted">Оплата на касі музею. Назвіть номер замовлення касиру.</p>
          </>
        )}
      </SuccessModal>
    </div>
  );
}
