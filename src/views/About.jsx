import { useRef } from 'react';
import Link from '../components/Link.jsx';
import { gsap, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import useReveal from '../hooks/useReveal.js';
import { tickets, contacts } from '../data/prices.js';
import Schedule from '../components/Schedule.jsx';

// Цифри — з сайту ukr-museum.org та плаката проєкту «Музеї нації»
const stats = [
  { value: 1000, label: 'років історії державності' },
  { value: 19, label: 'експозицій' },
  { value: 40, label: 'аудіогідів' },
  { value: 8, label: 'мов аудіогіда' }
];

// Мережа «Музеї нації» — одна місія, 4 локації
const network = [
  { city: 'Київ', name: 'Музей «Становлення української нації»', text: 'Шлях від Трипілля, Київської Русі до сучасної України.' },
  { city: 'Львів', name: 'Музей «Львів стародавній»', text: 'Історія Королівства Руського та середньовічного Львова.' },
  { city: 'Кам’янець-Подільський', name: 'Музей «Від Русі до України. Кам’янець крізь віки»', text: '1000-літня історія державності та таємниці Кам’янця.', current: true },
  { city: 'с. Гатне (Київщина)', name: 'Фортеця Гетьмана', text: 'Історико-культурний комплекс козацької доби.' }
];

export default function About() {
  const root = useRef(null);
  useReveal(root);

  useGSAP(
    () => {
      gsap.utils.toArray('.stat__num').forEach((el) => {
        const target = Number(el.dataset.value);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('uk-UA'))
        });
      });

      gsap.utils.toArray('.network-card').forEach((m, i) => {
        gsap.from(m, {
          x: i % 2 ? 80 : -80,
          opacity: 0,
          scrollTrigger: { trigger: m, start: 'top 85%', end: 'top 55%', scrub: 1 }
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <PageHero
        kicker="Про музей"
        title="Місто-фортеця пам’ятає"
        text="Музей у серці Старого міста Кам’янця-Подільського розповідає про тяглість української державності."
        image="/gallery/fasad-muzeiu.jpg"
        palette={['#1a1612', '#5d4520', '#0b0907']}
      />

      <section className="container section about-intro">
        <div data-reveal>
          <p className="section-kicker">Наша місія</p>
          <h2 className="section-title">Показати, що історія України — безперервна</h2>
        </div>
        <div className="about-intro__text" data-reveal="0.15">
          <p>
            Сучасний історичний музей про шлях України й Кам’янця крізь віки: 19 експозицій, діорами, реалістичні
            фігури історичних постатей, VR, артефакти, проєкції та аудіогіди. Кожен зал — окрема глава тисячолітньої історії.
          </p>
          <p>
            Особливе місце займає історія самого Кам’янця — міста, яке було фортецею Коріатовичів, османським
            форпостом і тимчасовою столицею Української Народної Республіки.
          </p>
          <Link to="/exhibitions" className="link-fx link-arrow">Переглянути експозиції →</Link>
        </div>
      </section>

      <section className="stats">
        <div className="container stats__grid">
          {stats.map((s) => (
            <div className="stat" key={s.label} data-reveal>
              <span className="stat__num" data-value={s.value}>0</span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <p className="section-kicker" data-reveal>Історико-освітній проєкт</p>
        <h2 className="section-title" data-reveal>«Музеї нації» — одна місія, 4 локації</h2>
        <p className="network-lead" data-reveal>
          Сучасні музейні простори, де історія оживає завдяки фігурам, діорамам, артефактам, мультимедіа, VR,
          аудіогідам та інтерактивам.
        </p>
        <div className="network">
          {network.map((m) => (
            <div className={`network-card ${m.current ? 'network-card--current' : ''}`} key={m.name}>
              <span className="network-card__city">{m.city}</span>
              <h3>{m.name}</h3>
              <p>{m.text}</p>
              {m.current && <span className="network-card__badge">Ви тут</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="container section visit" data-reveal>
        <div>
          <h3>Години роботи</h3>
          <Schedule />
        </div>
        <div>
          <h3>Вартість</h3>
          <p>
            {tickets.filter((t) => t.featured).map((t) => (
              <span key={t.id}>
                {t.label} — {t.price} ₴
                <br />
              </span>
            ))}
            Сімейні — від {Math.min(...tickets.filter((t) => t.group === 'family').map((t) => t.price))} ₴
          </p>
          <Link to="/tickets" className="link-fx link-arrow">Пільги та купівля квитків →</Link>
        </div>
        <div>
          <h3>Адреса</h3>
          <p>{contacts.address}</p>
        </div>
        <div>
          <h3>Аудіогіди</h3>
          <p>40 аудіогідів 8 мовами. Групові візити: <a className="link-fx" href={`tel:${contacts.groupsPhone.replace(/[^\d+]/g, '')}`}>{contacts.groupsPhone}</a></p>
        </div>
      </section>
    </div>
  );
}
