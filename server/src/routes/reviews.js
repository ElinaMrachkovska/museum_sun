import { Router } from 'express';
import { db } from '../db/index.js';
import { minLen, str, assertValid } from '../validate.js';

const router = Router();

const toPublic = (r) => ({ id: r._id, name: r.name, type: r.type, rating: r.rating, text: r.text, date: r.createdAt.slice(0, 10) });

router.get('/', async (req, res) => {
  const rows = await db().find('reviews', {}, { sort: { createdAt: -1 }, limit: 100 });
  res.json({ reviews: rows.map(toPublic) });
});

router.post('/', async (req, res) => {
  const b = req.body ?? {};
  const type = b.type === 'suggestion' ? 'suggestion' : 'review';
  const rating = Number(b.rating);
  const errors = {};
  if (!minLen(b.name, 2)) errors.name = 'Вкажіть ім’я';
  if (type === 'review' && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) errors.rating = 'Поставте оцінку';
  if (!minLen(b.text, 15)) errors.text = 'Щонайменше 15 символів';
  assertValid(errors);

  const review = await db().insert('reviews', {
    name: str(b.name, 60),
    type,
    rating: type === 'review' ? rating : 0,
    text: str(b.text, 1500),
    createdAt: new Date().toISOString()
  });
  res.status(201).json({ review: toPublic(review) });
});

export default router;
