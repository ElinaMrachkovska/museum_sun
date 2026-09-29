// Ціни зберігаються на сервері: сума замовлення рахується тут,
// а не береться з браузера (інакше ціну можна підмінити).
// ⚠ Тримайте в синхроні з src/data/prices.js (фронтенд).
export const tickets = [
  { id: 'adult', label: 'Дорослий', price: 370 },
  { id: 'youth', label: 'Юнацький (7–16 років)', price: 300 },
  { id: 'social', label: 'Соціальний', price: 260 },
  { id: 'family1', label: 'Сімейний 1 (1 дорослий + 2 дітей)', price: 680 },
  { id: 'family2', label: 'Сімейний 2 (2 дорослих + 1 дитина)', price: 750 },
  { id: 'family3', label: 'Сімейний 3 (2 дорослих + 2 дітей)', price: 1050 },
  { id: 'lastTuesday', label: 'Останній вівторок місяця', price: 10, lastTuesdayOnly: true },
  { id: 'free', label: 'Супровід (безкоштовно)', price: 0 }
];

export const sessionTimes = ['09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30'];

export const MAX_PER_TYPE = 20;
