import { DataAPIClient } from '@datastax/astra-db-ts';

// Сховище на DataStax Astra DB (Data API, колекції документів).
export async function createAstraStore({ endpoint, token, keyspace }, collectionNames) {
  const client = new DataAPIClient();
  const db = client.db(endpoint, { token, keyspace });

  const existing = new Set(await db.listCollections({ nameOnly: true }));
  const collections = {};
  for (const name of collectionNames) {
    collections[name] = existing.has(name) ? db.collection(name) : await db.createCollection(name);
  }
  const col = (name) => {
    if (!collections[name]) throw new Error(`Невідома колекція: ${name}`);
    return collections[name];
  };

  return {
    kind: 'astra',
    async insert(name, doc) {
      const { insertedId } = await col(name).insertOne(doc);
      return { ...doc, _id: insertedId };
    },
    findOne: (name, filter) => col(name).findOne(filter),
    async find(name, filter = {}, { sort, limit = 100 } = {}) {
      let cursor = col(name).find(filter).limit(limit);
      if (sort) cursor = cursor.sort(sort);
      return cursor.toArray();
    },
    async update(name, filter, set) {
      const res = await col(name).updateOne(filter, { $set: set });
      return res.matchedCount;
    }
  };
}
