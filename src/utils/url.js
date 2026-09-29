// Шлях з урахуванням базової адреси сайту (/museum_sun на GitHub Pages).
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

export const url = (path = '/') => (path.startsWith('/') ? `${BASE}${path}` : path);

// Поточний шлях без базової адреси: '/museum_sun/tickets/' → '/tickets'
export const stripBase = (pathname) => {
  const p = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return p.replace(/\/+$/, '') || '/';
};
