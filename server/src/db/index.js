import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
import { createAstraStore } from './astra.js';
import { createMemoryStore } from './memory.js';

export const COLLECTIONS = ['users', 'orders', 'messages', 'reviews'];

let store;

export async function initDb() {
  const { endpoint, token } = config.astra;
  if (endpoint && token) {
    store = await createAstraStore(config.astra, COLLECTIONS);
    console.log(`✓ Astra DB підключено (keyspace: ${config.astra.keyspace})`);
  } else {
    const file = fileURLToPath(new URL('../../data/dev-db.json', import.meta.url));
    store = createMemoryStore(file, COLLECTIONS);
    console.log('! Astra DB не налаштовано — дані зберігаються у server/data/dev-db.json');
  }
  return store;
}

export const db = () => {
  if (!store) throw new Error('База даних ще не ініціалізована');
  return store;
};
