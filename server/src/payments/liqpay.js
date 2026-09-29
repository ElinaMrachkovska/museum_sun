import { createHash, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

// LiqPay (ПриватБанк). Підпис: base64(sha1(private_key + data + private_key)),
// як в офіційному SDK https://github.com/liqpay/sdk-nodejs.
const CHECKOUT_URL = 'https://www.liqpay.ua/api/3/checkout';
const API_URL = 'https://www.liqpay.ua/api/request';
const API_VERSION = 3;

const encode = (params) => Buffer.from(JSON.stringify(params)).toString('base64');
const sign = (data, algo = 'sha1') =>
  createHash(algo).update(config.liqpay.privateKey + data + config.liqpay.privateKey).digest('base64');

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

// Готує дані для форми оплати; браузер відправляє їх POST-запитом на сторінку LiqPay.
export function createCheckout(order) {
  const params = {
    public_key: config.liqpay.publicKey,
    version: API_VERSION,
    action: 'pay',
    amount: order.total,
    currency: 'UAH',
    description: `Квитки до музею «Від Русі до України», ${order.date} ${order.time}`,
    order_id: order._id,
    result_url: `${config.clientUrl}/payment-result/?order=${encodeURIComponent(order._id)}`,
    server_url: `${config.publicServerUrl}/api/payments/liqpay/callback`,
    language: 'uk',
    ...(config.liqpay.sandbox ? { sandbox: 1 } : {})
  };
  const data = encode(params);
  return { method: 'POST', url: CHECKOUT_URL, fields: { data, signature: sign(data) } };
}

// Перевіряє підпис повідомлення від LiqPay і повертає розкодовані дані.
// Документація згадує і SHA1, і SHA3-256 — приймаємо обидва.
export function verifyCallback(data, signature) {
  if (!data || !signature) return null;
  const ok = safeEqual(sign(data, 'sha1'), signature) || safeEqual(sign(data, 'sha3-256'), signature);
  if (!ok) return null;
  return JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
}

// Запит статусу напряму в LiqPay (якщо callback не дійшов, наприклад, при локальній розробці).
export async function fetchStatus(orderId) {
  const data = encode({ public_key: config.liqpay.publicKey, version: API_VERSION, action: 'status', order_id: orderId });
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data, signature: sign(data) })
  });
  return res.json();
}

// Статус LiqPay → статус замовлення
export function mapStatus(s) {
  if (s === 'success' || s === 'sandbox') return 'paid';
  if (s === 'failure' || s === 'error') return 'failed';
  if (s === 'reversed') return 'refunded';
  return 'pending';
}
