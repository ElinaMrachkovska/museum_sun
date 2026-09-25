import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '../gsap.js';
import PageHero from '../components/PageHero.jsx';
import useReveal from '../hooks/useReveal.js';

const stats = [
  { value: 12000, label: 'експонатів у фондах' },
  { value: 7, label: 'історичних залів' },
  { value: 1100, label: 'років історії' },
  { value: 45000, label: 'відвідувачів щороку' }
];

const milestones = [
  { year: '1890', text: 'Подільський єпархіальний історико-статистичний комітет збирає першу колекцію старожитностей краю.' },
  { year: '1920', text: 'Колекції передано під опіку українського університету в Кам’янці.' },
  { year: '1991', text: 'Після відновлення незалежності фонди поповнюються документами доби УНР.' },
  { year: '2026', text: 'Відкрито оновлену мультимедійну експозицію «Від Русі до України».' }
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

      gsap.utils.toArray('.milestone').forEach((m, i) => {
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
        video="/videos/about.mp4"
        palette={['#1a1612', '#5d4520', '#0b0907']}
      />

      <section className="container section about-intro">
        <div data-reveal>
          <p className="section-kicker">Наша місія</p>
          <h2 className="section-title">Показати, що історія України — безперервна</h2>
        </div>
        <div className="about-intro__text" data-reveal="0.15">
          <p>
            Ми зберігаємо та досліджуємо пам’ятки від часів Київської Русі до сьогодення. Експозиція побудована
            як подорож крізь епохи: кожен зал — окрема глава, де артефакти, відео та звук створюють відчуття присутності.
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
        <p className="section-kicker" data-reveal>Історія музею</p>
        <h2 className="section-title" data-reveal>Віхи</h2>
        <div className="milestones">
          {milestones.map((m) => (
            <div className="milestone" key={m.year}>
              <span className="milestone__year">{m.year}</span>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section visit" data-reveal>
        <div>
          <h3>Години роботи</h3>
          <p>Вівторок – неділя: 10:00 – 18:00<br />Каса зачиняється о 17:15<br />Понеділок — вихідний</p>
        </div>
        <div>
          <h3>Адреса</h3>
          <p>м. Кам’янець-Подільський,<br />Старе місто, вул. Замкова</p>
        </div>
        <div>
          <h3>Доступність</h3>
          <p>Пандус, ліфт до другого поверху, аудіогід для людей з порушенням зору.</p>
        </div>
      </section>
    </div>
  );
}
