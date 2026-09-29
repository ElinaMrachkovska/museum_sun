// Ціни зберігаються на сервері: сума замовлення рахується тут,
// а не береться з браузера (інакше ціну можна підмінити).
// ⚠ Тримайте в синхроні з src/data/prices.js (фронтенд).
export const tickets = [
  { id: 'full', label: 'Повний', price: 270 },
  { id: 'discount', label: 'Пільговий', price: 210 },
  { id: 'social', label: 'Соціальний (останній вівторок місяця)', price: 10, lastTuesdayOnly: true }
];

export const sessionTimes = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];

export const MAX_PER_TYPE = 20;
