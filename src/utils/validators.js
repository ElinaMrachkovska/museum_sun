// Валідатори на чистому JS.
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
export const isPhone = (v) => /^\+?3?8?0\d{9}$/.test(String(v).replace(/[\s()-]/g, ''));
export const minLen = (v, n) => String(v).trim().length >= n;

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

// Робочі дні музею: вівторок – неділя (понеділок — вихідний).
export const isMonday = (iso) => new Date(`${iso}T12:00:00`).getDay() === 1;

export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* сховище недоступне — ігноруємо */
    }
  }
};
