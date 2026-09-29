import express from 'express';
import cors from 'cors';
import { config, paymentMethods } from './config.js';
import { initDb, db } from './db/index.js';
import orders from './routes/orders.js';
import payments from './routes/payments.js';
import users from './routes/users.js';
import messages from './routes/messages.js';
import reviews from './routes/reviews.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Вебхуки платіжних сервісів приходять не з браузера, тож CORS їх не стосується
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin))
  })
);
// rawBody потрібен для перевірки підпису вебхука Monobank
app.use(express.json({ limit: '50kb', verify: (req, _res, buf) => (req.rawBody = buf) }));
app.use(express.urlencoded({ extended: false, limit: '50kb' })); // callback LiqPay

app.get('/api/health', (req, res) => res.json({ ok: true, db: db().kind, payments: paymentMethods() }));
app.use('/api/orders', orders);
app.use('/api/payments', payments);
app.use('/api/register', users);
app.use('/api/messages', messages);
app.use('/api/reviews', reviews);

app.use('/api', (req, res) => res.status(404).json({ error: 'Не знайдено' }));

// Єдиний обробник помилок (Express 5 сам ловить помилки async-обробників)
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Некоректний JSON' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Помилка сервера. Спробуйте пізніше.' : err.message, fields: err.fields });
});

await initDb();
app.listen(config.port, () => {
  const m = paymentMethods();
  console.log(`✓ Сервер музею: http://localhost:${config.port}`);
  console.log(`  LiqPay: ${m.liqpay ? (config.liqpay.sandbox ? 'тестовий режим' : 'бойовий режим') : 'не налаштовано'}`);
  console.log(`  Monobank: ${m.monobank ? 'налаштовано' : 'не налаштовано'}`);
});
