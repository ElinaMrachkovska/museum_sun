import { Router } from 'express';
import { db } from '../db/index.js';
import { isEmail, minLen, str, assertValid } from '../validate.js';

const TOPICS = ['Загальне питання', 'Групова екскурсія', 'Співпраця / волонтерство', 'Передати експонат', 'Преса'];
const router = Router();

// Форма зворотного зв’язку
router.post('/', async (req, res) => {
  const b = req.body ?? {};
  const errors = {};
  if (!minLen(b.name, 2)) errors.name = 'Вкажіть ім’я';
  if (!isEmail(b.email)) errors.email = 'Некоректний e-mail';
  if (!TOPICS.includes(b.topic)) errors.topic = 'Оберіть тему';
  if (!minLen(b.message, 10)) errors.message = 'Повідомлення має містити щонайменше 10 символів';
  if (b.agree !== true) errors.agree = 'Потрібна згода';
  assertValid(errors);

  await db().insert('messages', {
    name: str(b.name, 100),
    email: str(b.email, 200).toLowerCase(),
    topic: b.topic,
    message: str(b.message, 1000),
    status: 'new',
    createdAt: new Date().toISOString()
  });
  res.status(201).json({ ok: true });
});

export default router;
