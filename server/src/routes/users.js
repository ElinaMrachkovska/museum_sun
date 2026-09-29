import { Router } from 'express';
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import { db } from '../db/index.js';
import { isEmail, isPhone, minLen, str, assertValid } from '../validate.js';

const scrypt = promisify(scryptCb);
const router = Router();

// Пароль зберігається лише як хеш scrypt із сіллю
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}

const strongEnough = (p) =>
  p.length >= 8 && [/[A-ZА-ЯІЇЄҐ]/, /\d/, /[^\wА-Яа-яІіЇїЄєҐґ]/].filter((r) => r.test(p)).length >= 2;

const INTERESTS = ['Київська Русь', 'Козацтво', 'Доба УНР', 'Реконструкції битв', 'Лекції', 'Дитячі програми'];

router.post('/', async (req, res) => {
  const b = req.body ?? {};
  const email = str(b.email, 200).toLowerCase();
  const password = String(b.password ?? '');
  const errors = {};

  if (!minLen(b.firstName, 2)) errors.firstName = 'Вкажіть ім’я';
  if (!minLen(b.lastName, 2)) errors.lastName = 'Вкажіть прізвище';
  if (!isEmail(email)) errors.email = 'Некоректний e-mail';
  if (b.phone && !isPhone(b.phone)) errors.phone = 'Формат: +380XXXXXXXXX';
  if (!strongEnough(password)) errors.password = 'Мінімум 8 символів, великі літери, цифри або символи';
  if (b.agree !== true) errors.agree = 'Потрібна згода на обробку даних';
  assertValid(errors);

  if (await db().findOne('users', { email })) {
    return res.status(409).json({ error: 'Цей e-mail вже зареєстровано', fields: { email: 'Цей e-mail вже зареєстровано' } });
  }

  const user = await db().insert('users', {
    firstName: str(b.firstName, 60),
    lastName: str(b.lastName, 60),
    email,
    phone: str(b.phone, 20),
    passwordHash: await hashPassword(password),
    interests: (Array.isArray(b.interests) ? b.interests : []).filter((i) => INTERESTS.includes(i)),
    newsletter: b.newsletter === true,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ user: { firstName: user.firstName, email: user.email } });
});

export default router;
