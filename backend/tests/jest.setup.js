const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

/**
 * Converts values of data into mongoose types
 */
const revive = (val) => {
  if (Array.isArray(val)) return val.map(revive);

  if (val && typeof val === 'object') {
    if (val.$oid) return new mongoose.Types.ObjectId(val.$oid);
    if (val.$date) return new Date(val.$date);

    const out = {};
    for (const [k, v] of Object.entries(val)) out[k] = revive(v);
    return out;
  }
  return val;
};

/**
 * Loads json data revived into mongoose values
 */
const loadJson = (relPath) => {
  const abs = path.join(__dirname, relPath);
  const raw = fs.readFileSync(abs, 'utf8');
  return revive(JSON.parse(raw));
};

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  const users = loadJson('./fixtures/users.json');
  const units = loadJson('./fixtures/units.json');
  const reviews = loadJson('./fixtures/reviews.json');

  if (users.length)
    await mongoose.connection.collection('users').insertMany(users);
  if (units.length)
    await mongoose.connection.collection('units').insertMany(units);
  if (reviews.length)
    await mongoose.connection.collection('reviews').insertMany(reviews);
});

afterEach(async () => {
  const collecs = await mongoose.connection.db.collections();
  for (const c of collecs) {
    await c.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
