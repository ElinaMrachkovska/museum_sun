import { randomBytes } from 'node:crypto';
import { db } from './db/index.js';
import * as liqpay from './payments/liqpay.js';
import * as monobank from './payments/monobank.js';

export const newOrderId = () => `KP-${randomBytes(6).toString('hex').toUpperCase()}`;

// Дозволені переходи статусів: оплачене замовлення не може знову стати «очікує».
const TRANSITIONS = {
  pending: ['paid', 'failed', 'refunded'],
  failed: ['paid', 'pending'],
  paid: ['refunded'],
  reserved: [],
  refunded: []
};

export async function applyPaymentStatus(order, status, { amount, providerStatus, modifiedDate } = {}) {
  if (status === order.status || !TRANSITIONS[order.status]?.includes(status)) return order;

  // Старіший вебхук (Monobank не гарантує порядок) — ігноруємо
  if (modifiedDate && order.providerModifiedDate && modifiedDate < order.providerModifiedDate) return order;

  // Сума, яку підтвердив платіжний сервіс, має збігатися із сумою замовлення
  if (status === 'paid' && amount !== undefined && Math.abs(Number(amount) - order.total) > 0.001) {
    console.warn(`! Сума оплати ${amount} не збігається із замовленням ${order._id} (${order.total})`);
    return order;
  }

  const now = new Date().toISOString();
  const set = {
    status,
    providerStatus,
    updatedAt: now,
    ...(modifiedDate ? { providerModifiedDate: modifiedDate } : {}),
    ...(status === 'paid' ? { paidAt: now } : {})
  };
  // Умова на поточний статус захищає від гонки двох одночасних повідомлень
  const matched = await db().update('orders', { _id: order._id, status: order.status }, set);
  if (matched) console.log(`✓ Замовлення ${order._id}: ${order.status} → ${status}`);
  return matched ? { ...order, ...set } : db().findOne('orders', { _id: order._id });
}

// Якщо повідомлення від платіжного сервісу не дійшло (локальна розробка без публічної адреси),
// статус запитується напряму під час перевірки замовлення.
export async function refreshFromProvider(order) {
  if (order.status !== 'pending') return order;
  try {
    if (order.payment === 'liqpay') {
      const r = await liqpay.fetchStatus(order._id);
      if (r.status && r.status !== 'error') {
        return applyPaymentStatus(order, liqpay.mapStatus(r.status), { amount: r.amount, providerStatus: r.status });
      }
    }
    if (order.payment === 'monobank' && order.providerInvoiceId) {
      const r = await monobank.fetchStatus(order.providerInvoiceId);
      return applyPaymentStatus(order, monobank.mapStatus(r.status), {
        amount: r.amount / 100,
        providerStatus: r.status,
        modifiedDate: r.modifiedDate
      });
    }
  } catch (e) {
    console.warn(`! Не вдалося оновити статус ${order._id}: ${e.message}`);
  }
  return order;
}

// Дані замовлення, які можна показати відвідувачу (без телефону та повного e-mail)
export const publicOrder = (o) => ({
  id: o._id,
  status: o.status,
  payment: o.payment,
  total: o.total,
  date: o.date,
  time: o.time,
  items: o.items,
  email: o.email.replace(/^(.).*(@.*)$/, '$1***$2'),
  createdAt: o.createdAt
});
