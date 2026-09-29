// Серверна валідація — дублює перевірки форм, бо браузеру довіряти не можна.
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v ?? '').trim());
export const isPhone = (v) => /^\+?3?8?0\d{9}$/.test(String(v ?? '').replace(/[\s()-]/g, ''));
export const str = (v, max = 500) => String(v ?? '').trim().slice(0, max);
export const minLen = (v, n) => str(v).length >= n;

export const todayKyiv = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Kyiv' }).format(new Date());

export const isMonday = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay() === 1;

export class ValidationError extends Error {
  constructor(fields) {
    super('Перевірте правильність заповнення форми');
    this.status = 400;
    this.fields = fields;
  }
}

export const assertValid = (fields) => {
  if (Object.keys(fields).length) throw new ValidationError(fields);
};
