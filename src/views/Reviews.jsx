import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import Field from '../components/Field.jsx';
import useForm from '../hooks/useForm.js';
import { minLen } from '../utils/validators.js';
import { api } from '../utils/api.js';

const initial = { name: '', type: 'review', rating: 0, text: '' };

const validate = (v) => {
  const e = {};
  if (!minLen(v.name, 2)) e.name = 'Вкажіть ім’я';
  if (v.type === 'review' && !v.rating) e.rating = 'Поставте оцінку';
  if (!minLen(v.text, 15)) e.text = 'Щонайменше 15 символів';
  return e;
};

const Stars = ({ value }) => (
  <span className="stars" aria-label={`Оцінка ${value} з 5`}>
    {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= value ? 'on' : ''}>★</span>)}
  </span>
);

export default function Reviews() {
  const root = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState('');
  const [tab, setTab] = useState('all');
  const [hover, setHover] = useState(0);
  const form = useForm(initial, validate);
  const { values, onChange, onBlur, setValue, fieldError } = form;

  const shown = useMemo(() => (tab === 'all' ? items : items.filter((r) => r.type === tab)), [items, tab]);
  const rated = items.filter((r) => r.rating);
  const avg = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : 0;

  useGSAP(
    () => {
      gsap.from('.review', { y: 40, opacity: 0, stagger: 0.07, duration: 0.6 });
    },
    { scope: root, dependencies: [tab, loading] }
  );

  useEffect(() => {
    api('/api/reviews')
      .then(({ reviews }) => setItems(reviews))
      .catch((e) => setServerError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = form.handleSubmit(async (v) => {
    setSending(true);
    setServerError('');
    let review;
    try {
      ({ review } = await api('/api/reviews', { method: 'POST', body: v }));
    } catch (e) {
      form.applyServerErrors(e.fields);
      if (!Object.keys(e.fields || {}).length) setServerError(e.message);
      setSending(false);
      return;
    }
    setSending(false);
    setItems((list) => [review, ...list]);
    form.reset();
    setTab('all');
    requestAnimationFrame(() => {
      gsap.fromTo(document.querySelector('.review'), { scale: 0.8, opacity: 0, backgroundColor: 'rgba(201,162,74,0.35)' }, { scale: 1, opacity: 1, backgroundColor: 'rgba(255,255,255,0.03)', duration: 1.2, ease: 'elastic.out(1, 0.6)' });
    });
  });

  return (
    <div ref={root}>
      <PageHero
        kicker="Відгуки та пропозиції"
        title="Ваш голос у літописі музею"
        text="Поділіться враженнями або підкажіть, як нам стати кращими."
        video="/videos/reviews.mp4"
        palette={['#171310', '#5a3524', '#0a0807']}
      />

      <section className="container section reviews">
        <div className="reviews__list">
          <div className="reviews__head">
            <div className="rating-total">
              <strong>{avg.toFixed(1)}</strong>
              <Stars value={Math.round(avg)} />
              <span className="muted">{rated.length} оцінок</span>
            </div>
            <div className="filters">
              {[['all', 'Усі'], ['review', 'Відгуки'], ['suggestion', 'Пропозиції']].map(([id, label]) => (
                <button key={id} type="button" className={`chip ${tab === id ? 'is-active' : ''}`} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>
          </div>

          {loading && <p className="muted">Завантажуємо відгуки…</p>}
          {!loading && !serverError && shown.length === 0 && (
            <p className="muted">Поки що тут порожньо — будьте першими, хто поділиться враженнями.</p>
          )}
          {shown.map((r) => (
            <article className="review" key={r.id}>
              <header>
                <span className="review__avatar">{r.name.charAt(0)}</span>
                <div>
                  <strong>{r.name}</strong>
                  <span className="muted"> · {new Date(r.date).toLocaleDateString('uk-UA')}</span>
                </div>
                <span className={`review__type review__type--${r.type}`}>{r.type === 'review' ? 'Відгук' : 'Пропозиція'}</span>
              </header>
              {r.rating > 0 && <Stars value={r.rating} />}
              <p>{r.text}</p>
            </article>
          ))}
        </div>

        <form className="form reviews__form" onSubmit={submit} noValidate>
          <h2 className="section-title">Залишити відгук</h2>
          <div className="radio-group">
            {[['review', 'Відгук'], ['suggestion', 'Пропозиція']].map(([val, label]) => (
              <label key={val} className={`radio ${values.type === val ? 'is-checked' : ''}`}>
                <input type="radio" name="type" value={val} checked={values.type === val} onChange={onChange} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <Field label="Ім’я" name="name" value={values.name} onChange={onChange} onBlur={onBlur} error={fieldError('name')} />

          {values.type === 'review' && (
            <div className="field">
              <span className="field__label">Оцінка</span>
              <div className="star-input" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={n <= (hover || values.rating) ? 'on' : ''}
                    aria-label={`${n} з 5`}
                    onMouseEnter={() => setHover(n)}
                    onClick={(e) => {
                      setValue('rating', n);
                      gsap.fromTo(e.currentTarget, { rotate: -30, scale: 1.6 }, { rotate: 0, scale: 1, ease: 'back.out(3)' });
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="field__error">{fieldError('rating') || ''}</span>
            </div>
          )}

          <Field
            label={values.type === 'review' ? 'Ваші враження' : 'Ваша пропозиція'}
            name="text"
            as="textarea"
            rows={5}
            value={values.text}
            onChange={onChange}
            onBlur={onBlur}
            error={fieldError('text')}
          />
          {serverError && <p className="form-alert" role="alert">{serverError}</p>}
          <button type="submit" className="btn btn--gold" disabled={sending}>
            {sending ? 'Публікуємо…' : 'Опублікувати'}
          </button>
        </form>
      </section>
    </div>
  );
}
