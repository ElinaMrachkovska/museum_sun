// Валідатори на чистому JS.
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
export const isPhone = (v) => /^\+?3?8?0\d{9}$/.test(String(v).replace(/[\s()-]/g, ''));
export const minLen = (v, n) => String(v).trim().length >= n;

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const toISO = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};

// Останній вівторок місяця: вівторок, і через тиждень уже інший місяць
export const isLastTuesday = (iso) => {
  if (!iso) return false;
  const d = new Date(`${iso}T12:00:00`);
  const next = new Date(d);
  next.setDate(d.getDate() + 7);
  return d.getDay() === 2 && next.getMonth() !== d.getMonth();
};

// Найближчий останній вівторок місяця (сьогодні або пізніше), у форматі YYYY-MM-DD
export const nextLastTuesday = (fromISO = todayISO()) => {
  const d = new Date(`${fromISO}T12:00:00`);
  for (let i = 0; i < 62; i += 1) {
    const iso = toISO(d);
    if (isLastTuesday(iso)) return iso;
    d.setDate(d.getDate() + 1);
  }
  return null;
};

export const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
