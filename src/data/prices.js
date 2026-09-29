// Ціни на квитки та пільгові категорії — за даними https://ukr-museum.org (сторінки «Квитки»
// та «Правила відвідування»). Останній вівторок місяця — за вказівкою замовника.
// ⚠ Ті самі ціни мають бути в server/src/catalog.js — сума замовлення рахується на сервері.

export const tickets = [
  { id: 'adult', label: 'Дорослий', price: 370, note: 'Для дорослих від 17 років', featured: true },
  { id: 'youth', label: 'Юнацький', price: 300, note: 'Для дітей від 7 до 16 років', featured: true },
  {
    id: 'social',
    label: 'Соціальний',
    price: 260,
    note: 'Для пільгових категорій — за документом',
    featured: true,
    categories: [
      'пенсіонери',
      'учасники АТО, учасники бойових дій',
      'родина загиблого військовослужбовця',
      'військовослужбовці строкової служби, курсанти ВНЗ',
      'особи з інвалідністю II–III групи, діти з інвалідністю та 1 супроводжуючий',
      'багатодітні сім’ї',
      'чорнобильці',
      'переміщені особи',
      'діти-сироти (без супроводу)'
    ]
  },
  { id: 'family1', label: 'Сімейний 1', price: 680, note: '1 дорослий + 2 дітей', group: 'family' },
  { id: 'family2', label: 'Сімейний 2', price: 750, note: '2 дорослих + 1 дитина', group: 'family' },
  { id: 'family3', label: 'Сімейний 3', price: 1050, note: '2 дорослих + 2 дітей', group: 'family' },
  {
    id: 'lastTuesday',
    label: 'Останній вівторок місяця',
    price: 10,
    note: 'Лише в останній вівторок місяця, за документом',
    lastTuesdayOnly: true,
    categories: ['пенсіонери', 'багатодітні сім’ї', 'ветерани ЗСУ', 'діти-сироти (без супроводу)', 'переміщені особи']
  },
  {
    id: 'free',
    label: 'Супровід',
    price: 0,
    note: 'За документом, що підтверджує право на пільгу',
    categories: [
      'діти до 6 років',
      'особи з інвалідністю I групи та 1 супроводжуючий',
      'Герої України',
      'почесні громадяни міста'
    ]
  }
];

export const sessionTimes = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00'];

export const openingHours = 'Щодня: 09:00 – 20:00';

// Контакти — за даними https://ukr-museum.org/index.php?page=contacts
export const contacts = {
  name: 'Від Русі до України. Кам’янець крізь віки',
  address: 'м. Кам’янець-Подільський, площа Польський ринок, 19, приміщення 5',
  phone: '+38 095 095 36 36',
  groupsPhone: '+38 067 571 77 03',
  email: 'info@ukr-museum.org',
  socials: [
    { label: 'Facebook', url: 'https://www.facebook.com/vid.rusi.do.ukrainy.kp/' },
    { label: 'Instagram', url: 'https://www.instagram.com/museumsunkp/' },
    { label: 'TikTok', url: 'https://www.tiktok.com/@vid.rusi.kamianets' }
  ]
};

export const tel = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;
