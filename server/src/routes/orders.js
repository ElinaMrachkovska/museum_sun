import { Router } from 'express';
import { db } from '../db/index.js';
import { tickets, sessionTimes, MAX_PER_TYPE } from '../catalog.js';
import { paymentMethods } from '../config.js';
import { isEmail, isPhone, minLen, str, todayKyiv, isLastTuesday, assertValid } from '../validate.js';
import { newOrderId, publicOrder, refreshFromProvider } from '../orders.js';
import * as liqpay from '../payments/liqpay.js';
import * as monobank from '../payments/monobank.js';

const router = Router();

// Створення замовлення + платежу
router.post('/', async (req, res) => {
  const b = req.body ?? {};
  const qty = b.tickets ?? {};
  const errors = {};

  const items = tickets
    .map((t) => ({ ...t, qty: Number.parseInt(qty[t.id], 10) || 0 }))
    .filter((t) => t.qty > 0);
  if (items.some((t) => t.qty < 0 || t.qty > MAX_PER_TYPE)) errors.tickets = `Не більше ${MAX_PER_TYPE} квитків кожного типу`;
  if (!items.length) errors.tickets = 'Додайте хоча б один квиток';
  if (!minLen(b.name, 2)) errors.name = 'Вкажіть ім’я та прізвище';
  if (!isEmail(b.email)) errors.email = 'Некоректний e-mail';
  if (!isPhone(b.phone)) errors.phone = 'Формат: +380XXXXXXXXX';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date ?? '')) errors.date = 'Оберіть дату візиту';
  else if (b.date < todayKyiv()) errors.date = 'Дата не може бути в минулому';
  else if (items.some((t) => t.lastTuesdayOnly) && !isLastTuesday(b.date)) {
    errors.tickets = 'Соціальний квиток діє лише в останній вівторок місяця';
  }
  if (!sessionTimes.includes(b.time)) errors.time = 'Оберіть час';
  if (!['liqpay', 'monobank', 'cash'].includes(b.payment)) errors.payment = 'Оберіть спосіб оплати';
  else if (!paymentMethods()[b.payment]) errors.payment = 'Цей спосіб оплати зараз недоступний';
  if (b.agree !== true) errors.agree = 'Потрібна згода з правилами відвідування';
  assertValid(errors);

  const total = items.reduce((s, t) => s + t.price * t.qty, 0);
  const now = new Date().toISOString();
  // Безкоштовні квитки або оплата на касі — лише бронювання
  const payOnline = b.payment !== 'cash' && total > 0;

  const order = await db().insert('orders', {
    _id: newOrderId(),
    items: items.map(({ id, label, price, qty: q }) => ({ id, label, price, qty: q })),
    total,
    date: b.date,
    time: b.time,
    name: str(b.name, 100),
    email: str(b.email, 200).toLowerCase(),
    phone: str(b.phone, 20),
    payment: payOnline ? b.payment : 'cash',
    status: payOnline ? 'pending' : 'reserved',
    createdAt: now,
    updatedAt: now
  });

  if (!payOnline) return res.status(201).json({ order: publicOrder(order) });

  if (order.payment === 'liqpay') {
    return res.status(201).json({ order: publicOrder(order), redirect: liqpay.createCheckout(order) });
  }

  const { invoiceId, redirect } = await monobank.createInvoice(order);
  await db().update('orders', { _id: order._id }, { providerInvoiceId: invoiceId });
  return res.status(201).json({ order: publicOrder(order), redirect });
});

// Статус замовлення (сторінка результату оплати)
router.get('/:id', async (req, res) => {
  let order = await db().findOne('orders', { _id: str(req.params.id, 40) });
  if (!order) return res.status(404).json({ error: 'Замовлення не знайдено' });
  order = await refreshFromProvider(order);
  res.json({ order: publicOrder(order) });
});

export default router;
