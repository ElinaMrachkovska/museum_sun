// Ціни зберігаються на сервері: сума замовлення рахується тут,
// а не береться з браузера (інакше ціну можна підмінити).
export const tickets = [
  { id: 'adult', label: 'Дорослий', price: 150 },
  { id: 'student', label: 'Студентський / учнівський', price: 80 },
  { id: 'child', label: 'Дитячий (до 7 років)', price: 0 },
  { id: 'family', label: 'Сімейний (2 + 2)', price: 350 },
  { id: 'tour', label: 'Екскурсія з гідом', price: 250 }
];

export const sessionTimes = ['10:00', '11:30', '13:00', '14:30', '16:00'];

export const MAX_PER_TYPE = 20;
