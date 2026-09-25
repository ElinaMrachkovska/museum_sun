# Музей «Від Русі до України» — Кам’янець-Подільський

Багатосторінковий сайт історичного музею на **React + Vite**, **чистому JavaScript**, **Sass (SCSS)** та **GSAP** (ScrollTrigger, useGSAP).

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production-збірка в dist/
npm run preview  # перегляд збірки
```

## Сторінки

| Шлях | Зміст |
|---|---|
| `/` | Відеобанер із середньовічним боєм, розділи історії зі зміною відеобанерів при скролі, горизонтальна стрічка залів |
| `/about` | Про музей: лічильники, віхи, години роботи |
| `/exhibitions` | Експозиції з фільтром і 3D-нахилом карток |
| `/tickets` | Форма придбання квитка (типи квитків, дата й час, оплата, підсумок) |
| `/register` | Форма реєстрації (перевірка пароля, інтереси, згода) |
| `/contacts` | Форма зворотного зв’язку та карта |
| `/reviews` | Відгуки та пропозиції (оцінка зірками, фільтр) |

## Відео

Лежать у `public/videos/`, шляхи й тексти розділів — у `src/data/eras.js`.

| Файл | Розділ |
|---|---|
| `hero-battle.mp4` + `hero-battle.jpg` (постер) | Головний банер |
| `era-rus.mp4` | Київська Русь |
| `era-galych.mp4` | Галицько-Волинська держава |
| `era-lytva.mp4` | Литовсько-руська доба |
| `era-kozaky.mp4` | Козацька доба |
| `era-imperia.mp4` | Імперська доба |
| `era-unr.mp4` | Українська революція, УНР |
| `era-ukraine.mp4` | Незалежна Україна |

Відео взято з [Pexels](https://www.pexels.com) (безкоштовна ліцензія Pexels).
Для внутрішніх сторінок можна додати `about.mp4`, `exhibitions.mp4`, `tickets.mp4`, `register.mp4`, `contacts.mp4`, `reviews.mp4`.
Поки файлу немає, показується анімований фон у кольорах розділу.

## Анімації

- `src/hooks/useInteractiveFx.js` — GSAP для всіх кнопок і посилань: підйом при наведенні, «магнітні» кнопки, хвиля при кліку.
- `.link-fx` (Sass) — підкреслення посилань, `.btn::before` — заливка кнопок.
- Перехід між сторінками — «завіса» на GSAP (`src/App.jsx`).
- Головна: поява заголовка по літерах, паралакс банера, ScrollTrigger для розділів, прогрес хронології, закріплена стрічка залів.

## Дані форм

Бекенду немає: замовлення, повідомлення, профілі та відгуки зберігаються в `localStorage`
(`museum-orders`, `museum-messages`, `museum-users`, `museum-reviews`). Пароль не зберігається.

## Структура

```
src/
  App.jsx, main.jsx, gsap.js
  components/  Header, Footer, VideoBg, PageHero, Field, SuccessModal
  pages/       Home, About, Exhibitions, Tickets, Register, Contacts, Reviews, NotFound
  hooks/       useInteractiveFx, useForm, useReveal
  utils/       validators.js
  data/        eras.js
  styles/      _variables, _mixins, _base, components/*, pages/*, main.scss
```
