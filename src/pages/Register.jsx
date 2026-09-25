import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../gsap.js';
import VideoBg from '../components/VideoBg.jsx';
import Field from '../components/Field.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import useForm from '../hooks/useForm.js';
import { isEmail, isPhone, minLen, storage } from '../utils/validators.js';

const interests = ['Київська Русь', 'Козацтво', 'Доба УНР', 'Реконструкції битв', 'Лекції', 'Дитячі програми'];

const initial = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  interests: [],
  newsletter: true,
  agree: false
};

const passwordScore = (p) =>
  [p.length >= 8, /[A-ZА-ЯІЇЄҐ]/.test(p), /\d/.test(p), /[^\wА-Яа-яІіЇїЄєҐґ]/.test(p)].filter(Boolean).length;

const validate = (v) => {
  const e = {};
  if (!minLen(v.firstName, 2)) e.firstName = 'Вкажіть ім’я';
  if (!minLen(v.lastName, 2)) e.lastName = 'Вкажіть прізвище';
  if (!isEmail(v.email)) e.email = 'Некоректний e-mail';
  else if (storage.get('museum-users', []).some((u) => u.email === v.email.trim().toLowerCase())) e.email = 'Цей e-mail вже зареєстровано';
  if (v.phone && !isPhone(v.phone)) e.phone = 'Формат: +380XXXXXXXXX';
  if (v.password.length < 8) e.password = 'Мінімум 8 символів';
  else if (passwordScore(v.password) < 3) e.password = 'Додайте великі літери, цифри або символи';
  if (v.confirm !== v.password) e.confirm = 'Паролі не збігаються';
  if (!v.agree) e.agree = 'Потрібна згода на обробку даних';
  return e;
};

export default function Register() {
  const root = useRef(null);
  const [done, setDone] = useState(null);
  const form = useForm(initial, validate);
  const { values, onChange, onBlur, setValue, fieldError } = form;
  const score = passwordScore(values.password);

  useGSAP(
    () => {
      gsap
        .timeline({ delay: 0.3 })
        .from('.auth__intro > *', { x: -50, opacity: 0, stagger: 0.1 })
        .from('.auth__card', { y: 60, opacity: 0, duration: 1 }, '-=0.6')
        .from('.auth__card .field, .auth__card .chips, .auth__card .checkbox, .auth__card .btn', { y: 20, opacity: 0, stagger: 0.04 }, '-=0.6');
    },
    { scope: root }
  );

  const toggleInterest = (i) =>
    setValue('interests', values.interests.includes(i) ? values.interests.filter((x) => x !== i) : [...values.interests, i]);

  const submit = form.handleSubmit((v) => {
    // Демо без сервера: пароль НЕ зберігаємо, лише профіль.
    const user = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim().toLowerCase(),
      phone: v.phone,
      interests: v.interests,
      newsletter: v.newsletter,
      createdAt: new Date().toISOString()
    };
    storage.set('museum-users', [...storage.get('museum-users', []), user]);
    setDone(user);
  });

  return (
    <div ref={root} className="auth">
      <VideoBg src="/videos/register.mp4" palette={['#15110d', '#4d3318', '#090705']} className="auth__bg" />
      <div className="container auth__layout">
        <div className="auth__intro">
          <p className="section-kicker">Реєстрація</p>
          <h1 className="section-title">Долучайтеся до музейної спільноти</h1>
          <ul className="auth__perks">
            <li>Знижка 20% на квитки для зареєстрованих</li>
            <li>Запрошення на реконструкції та нічні екскурсії</li>
            <li>Історія ваших замовлень і відгуків</li>
          </ul>
        </div>

        <form className="auth__card form" onSubmit={submit} noValidate>
          <div className="form__row">
            <Field label="Ім’я" name="firstName" autoComplete="given-name" value={values.firstName} onChange={onChange} onBlur={onBlur} error={fieldError('firstName')} />
            <Field label="Прізвище" name="lastName" autoComplete="family-name" value={values.lastName} onChange={onChange} onBlur={onBlur} error={fieldError('lastName')} />
          </div>
          <div className="form__row">
            <Field label="E-mail" name="email" type="email" autoComplete="email" value={values.email} onChange={onChange} onBlur={onBlur} error={fieldError('email')} />
            <Field label="Телефон (необов’язково)" name="phone" type="tel" placeholder="+380" value={values.phone} onChange={onChange} onBlur={onBlur} error={fieldError('phone')} />
          </div>
          <div className="form__row">
            <div>
              <Field label="Пароль" name="password" type="password" autoComplete="new-password" value={values.password} onChange={onChange} onBlur={onBlur} error={fieldError('password')} />
              <div className={`strength strength--${score}`} aria-hidden="true"><span /><span /><span /><span /></div>
            </div>
            <Field label="Повторіть пароль" name="confirm" type="password" autoComplete="new-password" value={values.confirm} onChange={onChange} onBlur={onBlur} error={fieldError('confirm')} />
          </div>

          <p className="field__label">Що вас цікавить?</p>
          <div className="chips">
            {interests.map((i) => (
              <button type="button" key={i} className={`chip ${values.interests.includes(i) ? 'is-active' : ''}`} aria-pressed={values.interests.includes(i)} onClick={() => toggleInterest(i)}>
                {i}
              </button>
            ))}
          </div>

          <label className="checkbox">
            <input type="checkbox" name="newsletter" checked={values.newsletter} onChange={onChange} />
            <span>Отримувати новини музею</span>
          </label>
          <label className={`checkbox ${fieldError('agree') ? 'checkbox--error' : ''}`}>
            <input type="checkbox" name="agree" checked={values.agree} onChange={onChange} onBlur={onBlur} />
            <span>Погоджуюсь на обробку персональних даних</span>
          </label>
          <span className="field__error">{fieldError('agree') || ''}</span>

          <button type="submit" className="btn btn--gold btn--block">Зареєструватися</button>
        </form>
      </div>

      <SuccessModal open={!!done} title={`Вітаємо, ${done?.firstName || ''}!`} onClose={() => { setDone(null); form.reset(); }}>
        <p>Реєстрацію завершено. Лист з підтвердженням надіслано на <strong>{done?.email}</strong>.</p>
      </SuccessModal>
    </div>
  );
}
