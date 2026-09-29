import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import Field from '../components/Field.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import useForm from '../hooks/useForm.js';
import useReveal from '../hooks/useReveal.js';
import { isEmail, minLen } from '../utils/validators.js';
import { api } from '../utils/api.js';
import { openingHours } from '../data/prices.js';

const topics = ['Загальне питання', 'Групова екскурсія', 'Співпраця / волонтерство', 'Передати експонат', 'Преса'];

const initial = { name: '', email: '', topic: '', message: '', agree: false };

const validate = (v) => {
  const e = {};
  if (!minLen(v.name, 2)) e.name = 'Вкажіть ім’я';
  if (!isEmail(v.email)) e.email = 'Некоректний e-mail';
  if (!v.topic) e.topic = 'Оберіть тему';
  if (!minLen(v.message, 10)) e.message = 'Повідомлення має містити щонайменше 10 символів';
  if (!v.agree) e.agree = 'Потрібна згода';
  return e;
};

export default function Contacts() {
  const root = useRef(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const form = useForm(initial, validate);
  const { values, onChange, onBlur, fieldError } = form;
  useReveal(root);

  useGSAP(
    () => {
      gsap.from('.contact-item', { x: -40, opacity: 0, stagger: 0.12, delay: 0.5 });
    },
    { scope: root }
  );

  const submit = form.handleSubmit(async (v) => {
    setSending(true);
    setServerError('');
    try {
      await api('/api/messages', { method: 'POST', body: v });
      setSent(true);
    } catch (e) {
      form.applyServerErrors(e.fields);
      if (!Object.keys(e.fields || {}).length) setServerError(e.message);
    }
    setSending(false);
  });

  return (
    <div ref={root}>
      <PageHero
        kicker="Контакти"
        title="Зворотний зв’язок"
        text="Маєте запитання, ідею чи бажаєте передати експонат? Напишіть нам."
        video="/videos/contacts.mp4"
        palette={['#12151a', '#2d4052', '#08090b']}
      />

      <section className="container section contacts">
        <div className="contacts__info">
          <div className="contact-item">
            <span className="contact-item__label">Адреса</span>
            <p>м. Кам’янець-Подільський, Старе місто, вул. Замкова</p>
          </div>
          <div className="contact-item">
            <span className="contact-item__label">Телефон</span>
            <a className="link-fx" href="tel:+380380000000">+38 (038) 000-00-00</a>
          </div>
          <div className="contact-item">
            <span className="contact-item__label">E-mail</span>
            <a className="link-fx" href="mailto:info@rus-ukraine.museum">info@rus-ukraine.museum</a>
          </div>
          <div className="contact-item">
            <span className="contact-item__label">Години</span>
            <p>{openingHours}</p>
          </div>
          <div className="map" data-reveal>
            <iframe
              title="Карта: Стара фортеця, Кам'янець-Подільський"
              src="https://www.openstreetmap.org/export/embed.html?bbox=26.5635%2C48.6695%2C26.5775%2C48.6765&layer=mapnik&marker=48.6730%2C26.5705"
              loading="lazy"
            />
          </div>
        </div>

        <form className="form contacts__form" onSubmit={submit} noValidate data-reveal>
          <h2 className="section-title">Напишіть нам</h2>
          <Field label="Ім’я" name="name" autoComplete="name" value={values.name} onChange={onChange} onBlur={onBlur} error={fieldError('name')} />
          <Field label="E-mail" name="email" type="email" autoComplete="email" value={values.email} onChange={onChange} onBlur={onBlur} error={fieldError('email')} />
          <Field label="Тема" name="topic" as="select" value={values.topic} onChange={onChange} onBlur={onBlur} error={fieldError('topic')}>
            <option value="">Оберіть тему</option>
            {topics.map((t) => <option key={t}>{t}</option>)}
          </Field>
          <Field label="Повідомлення" name="message" as="textarea" rows={5} maxLength={1000} value={values.message} onChange={onChange} onBlur={onBlur} error={fieldError('message')} />
          <p className="counter">{values.message.length} / 1000</p>
          <label className={`checkbox ${fieldError('agree') ? 'checkbox--error' : ''}`}>
            <input type="checkbox" name="agree" checked={values.agree} onChange={onChange} onBlur={onBlur} />
            <span>Погоджуюсь на обробку персональних даних</span>
          </label>
          <span className="field__error">{fieldError('agree') || ''}</span>
          {serverError && <p className="form-alert" role="alert">{serverError}</p>}
          <button type="submit" className="btn btn--gold" disabled={sending}>
            {sending ? 'Надсилаємо…' : 'Надіслати'}
          </button>
        </form>
      </section>

      <SuccessModal open={sent} title="Повідомлення надіслано" onClose={() => { setSent(false); form.reset(); }}>
        <p>Дякуємо! Ми відповімо протягом двох робочих днів.</p>
      </SuccessModal>
    </div>
  );
}
