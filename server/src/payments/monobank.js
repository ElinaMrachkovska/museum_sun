import { createVerify } from 'node:crypto';
import { config } from '../config.js';

// Monobank acquiring (plata by mono): https://api.monobank.ua/docs/acquiring.html
// MONO_API_URL — лише для тестів з імітатором API; за замовчуванням офіційна адреса
const API = `${(process.env.MONO_API_URL || 'https://api.monobank.ua').replace(/\/+$/, '')}/api/merchant`;

async function mono(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'X-Token': config.monobank.token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Monobank: ${data.errText || data.errCode || res.status}`);
    err.status = 502;
    throw err;
  }
  return data;
}

export async function createInvoice(order) {
  const { invoiceId, pageUrl } = await mono('/invoice/create', {
    method: 'POST',
    body: {
      amount: Math.round(order.total * 100), // копійки
      ccy: 980,
      merchantPaymInfo: {
        reference: order._id,
        destination: `Квитки до музею «Від Русі до України», ${order.date} ${order.time}`,
        basketOrder: order.items.map((i) => ({
          name: i.label,
          qty: i.qty,
          sum: Math.round(i.price * 100),
          total: Math.round(i.price * i.qty * 100),
          code: i.id
        }))
      },
      redirectUrl: `${config.clientUrl}/payment-result/?order=${encodeURIComponent(order._id)}`,
      webHookUrl: `${config.publicServerUrl}/api/payments/monobank/webhook`,
      validity: 60 * 60
    }
  });
  return { invoiceId, redirect: { method: 'GET', url: pageUrl } };
}

export const fetchStatus = (invoiceId) => mono(`/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`);

// Відкритий ключ для перевірки вебхуків. Кешуємо; при невдалій перевірці — оновлюємо.
let pubKey = null;
async function getPubKey(force = false) {
  if (!pubKey || force) {
    const { key } = await mono('/pubkey');
    pubKey = Buffer.from(key, 'base64').toString('utf8');
  }
  return pubKey;
}

export const verifySignature = (rawBody, xSign, pem) =>
  createVerify('SHA256').update(rawBody).verify(pem, Buffer.from(String(xSign), 'base64'));

export async function verifyWebhook(rawBody, xSign) {
  if (!rawBody || !xSign) return false;
  if (verifySignature(rawBody, xSign, await getPubKey())) return true;
  return verifySignature(rawBody, xSign, await getPubKey(true)); // ключ могли змінити
}

// Статус Monobank → статус замовлення
export function mapStatus(s) {
  if (s === 'success') return 'paid';
  if (s === 'failure' || s === 'expired') return 'failed';
  if (s === 'reversed') return 'refunded';
  return 'pending'; // created, processing, hold
}
