import { Router } from 'express';
import { db } from '../db/index.js';
import { paymentMethods } from '../config.js';
import { applyPaymentStatus } from '../orders.js';
import * as liqpay from '../payments/liqpay.js';
import * as monobank from '../payments/monobank.js';

const router = Router();

// Які способи оплати налаштовані на сервері
router.get('/methods', (req, res) => res.json(paymentMethods()));

// Повідомлення від LiqPay (application/x-www-form-urlencoded: data, signature)
router.post('/liqpay/callback', async (req, res) => {
  const payload = liqpay.verifyCallback(req.body?.data, req.body?.signature);
  if (!payload) return res.status(400).json({ error: 'Невірний підпис' });

  const order = await db().findOne('orders', { _id: String(payload.order_id) });
  if (!order) return res.status(404).json({ error: 'Замовлення не знайдено' });

  await applyPaymentStatus(order, liqpay.mapStatus(payload.status), {
    amount: payload.amount,
    providerStatus: payload.status
  });
  res.sendStatus(200);
});

// Вебхук Monobank (JSON + підпис ECDSA у заголовку X-Sign)
router.post('/monobank/webhook', async (req, res) => {
  const valid = await monobank.verifyWebhook(req.rawBody, req.get('X-Sign'));
  if (!valid) return res.status(400).json({ error: 'Невірний підпис' });

  const p = req.body;
  const order = await db().findOne('orders', { _id: String(p.reference) });
  if (!order || order.providerInvoiceId !== p.invoiceId) return res.sendStatus(200); // не наше — не повторювати

  await applyPaymentStatus(order, monobank.mapStatus(p.status), {
    amount: p.amount / 100,
    providerStatus: p.status,
    modifiedDate: p.modifiedDate
  });
  res.sendStatus(200);
});

export default router;
