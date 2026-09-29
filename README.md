# Музей «Від Русі до України» — Кам’янець-Подільський

Багатосторінковий сайт історичного музею на **React + Vite**, **чистому JavaScript**, **Sass (SCSS)** та **GSAP** (ScrollTrigger, useGSAP).

**Сайт:** https://elinamrachkovska.github.io/museum_sun/

**Стек:** [Astro](https://astro.build) + React-острівці, чистий JavaScript, Sass, GSAP · бекенд на **Node.js (Express)** · база **DataStax Astra DB** · оплата **LiqPay** і **Monobank**.

## Сторінки

| Шлях | Зміст |
|---|---|
| `/` | Відеобанер із середньовічним боєм, розділи історії зі зміною відеобанерів при скролі, горизонтальна стрічка залів |
| `/about` | Про музей: лічильники, віхи, години роботи |
| `/exhibitions` | Експозиції з фільтром і 3D-нахилом карток |
| `/tickets` | Придбання квитка: LiqPay, Monobank або бронювання з оплатою на касі |
| `/payment-result` | Результат оплати (статус перевіряється на сервері) |
| `/register` | Реєстрація (перевірка пароля, інтереси, згода) |
| `/contacts` | Зворотний зв’язок і карта |
| `/reviews` | Відгуки та пропозиції (оцінка зірками, фільтр) |

## Структура

```
/            фронтенд (Astro) → статичний сайт для GitHub Pages
  src/pages/     сторінки .astro (маршрути)
  src/views/     React-компоненти сторінок (GSAP-анімації, форми)
  src/layouts/   спільний макет (шапка, підвал, «завіса» переходів)
server/      бекенд (Node.js + Express)
  src/routes/    API: замовлення, оплата, реєстрація, повідомлення, відгуки
  src/payments/  LiqPay, Monobank
  src/db/        Astra DB (або локальний JSON-файл для розробки)
```

## Запуск локально

Потрібен Node.js 20+. Два термінали:

```bash
# 1. Бекенд
npm run server:install
cp server/.env.example server/.env   # заповніть ключі (див. нижче)
npm run server                       # http://localhost:3001

# 2. Фронтенд
npm install
cp .env.example .env                 # PUBLIC_API_URL=http://localhost:3001
npm run dev                          # http://localhost:4321/museum_sun/
```

Без ключів сервер теж працює: дані пишуться у `server/data/dev-db.json`, доступна лише оплата на касі.

## API (server/)

| Метод | Шлях | Що робить |
|---|---|---|
| GET | `/api/health` | стан сервера, яка база і які способи оплати налаштовані |
| GET | `/api/payments/methods` | доступні способи оплати |
| POST | `/api/orders` | створює замовлення, рахує суму **на сервері**, повертає перехід на оплату |
| GET | `/api/orders/:id` | статус замовлення (для сторінки результату оплати) |
| POST | `/api/payments/liqpay/callback` | повідомлення від LiqPay (перевірка підпису) |
| POST | `/api/payments/monobank/webhook` | вебхук Monobank (перевірка підпису ECDSA `X-Sign`) |
| POST | `/api/register` | реєстрація (пароль зберігається як хеш scrypt) |
| POST | `/api/messages` | форма зворотного зв’язку |
| GET/POST | `/api/reviews` | відгуки та пропозиції |

## Налаштування ключів (`server/.env`)

**Astra DB.** На [astra.datastax.com](https://astra.datastax.com) створіть базу (Serverless, Vector або Non-vector) → *Connect* →
скопіюйте **API Endpoint** у `ASTRA_DB_API_ENDPOINT` і згенеруйте **Application Token** (`ASTRA_DB_APPLICATION_TOKEN`).
Колекції `users`, `orders`, `messages`, `reviews` сервер створить сам під час першого запуску.

**LiqPay.** У [кабінеті LiqPay](https://www.liqpay.ua) → *Налаштування → API* візьміть `public_key` і `private_key`.
`LIQPAY_SANDBOX=1` — тестові платежі (гроші не списуються).

**Monobank.** Тестовий токен: [api.monobank.ua](https://api.monobank.ua/) (увійти через застосунок). У тестовому режимі
підходить будь-яка картка, валідна за алгоритмом Луна. Бойовий токен — у [web.monobank.ua](https://web.monobank.ua).

**Повідомлення про оплату.** LiqPay і Monobank надсилають статус на `PUBLIC_SERVER_URL`. Локально ця адреса
недоступна з інтернету — тоді статус запитується в банку, коли відкривається сторінка результату. Щоб тестувати
і вебхуки, запустіть тунель (наприклад, `ngrok http 3001`) і вкажіть його адресу в `PUBLIC_SERVER_URL`.

## Публікація

**Фронтенд → GitHub Pages** (гілка `gh-pages`). У `.env` вкажіть HTTPS-адресу розгорнутого бекенду, потім:

```bash
npm run deploy
```

Одноразово: **Settings → Pages → Deploy from a branch → `gh-pages` / `(root)`**.

**Бекенд → будь-який Node.js-хостинг з HTTPS** (Render, Railway, Fly.io тощо): корінь — папка `server`,
команда запуску `npm start`, змінні з `server/.env.example`. У `CORS_ORIGINS` має бути `https://elinamrachkovska.github.io`,
у `CLIENT_URL` — `https://elinamrachkovska.github.io/museum_sun`.

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

- `src/scripts/interactive-fx.js` — GSAP для всіх кнопок і посилань: підйом при наведенні, «магнітні» кнопки, хвиля при кліку.
- `.link-fx` (Sass) — підкреслення посилань, `.btn::before` — заливка кнопок.
- Перехід між сторінками — «завіса» на GSAP (`src/scripts/page-transition.js`).
- Головна: поява заголовка по літерах, паралакс банера, ScrollTrigger для розділів, прогрес хронології, закріплена стрічка залів.
