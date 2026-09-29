import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

// Локальне сховище для розробки: JSON-файл. Той самий інтерфейс, що й Astra.
export function createMemoryStore(file, collectionNames) {
  let data = Object.fromEntries(collectionNames.map((n) => [n, []]));
  if (existsSync(file)) {
    try {
      data = { ...data, ...JSON.parse(readFileSync(file, 'utf8')) };
    } catch {
      /* пошкоджений файл — починаємо з порожньої бази */
    }
  }
  const save = () => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 2));
  };
  const matches = (doc, filter) => Object.entries(filter).every(([k, v]) => doc[k] === v);
  const clone = (d) => (d ? structuredClone(d) : null);

  return {
    kind: 'file',
    async insert(name, doc) {
      const saved = { _id: randomUUID(), ...doc };
      if (data[name].some((d) => d._id === saved._id)) throw new Error('Документ з таким _id вже існує');
      data[name].push(saved);
      save();
      return clone(saved);
    },
    async findOne(name, filter) {
      return clone(data[name].find((d) => matches(d, filter)));
    },
    async find(name, filter = {}, { sort, limit = 100 } = {}) {
      let rows = data[name].filter((d) => matches(d, filter));
      if (sort) {
        const [[field, dir]] = Object.entries(sort);
        rows = [...rows].sort((a, b) => (a[field] > b[field] ? dir : a[field] < b[field] ? -dir : 0));
      }
      return rows.slice(0, limit).map(clone);
    },
    async update(name, filter, set) {
      const doc = data[name].find((d) => matches(d, filter));
      if (!doc) return 0;
      Object.assign(doc, set);
      save();
      return 1;
    }
  };
}
