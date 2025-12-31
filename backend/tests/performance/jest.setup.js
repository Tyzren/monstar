const app = require('../../server');
const MockUpstashRedis = require('./mocks/redis.mock');

jest.mock('@upstash/redis', () => {
  const MockUpstashRedis = require('./mocks/redis.mock');
  return { Redis: (new MockUpstashRedis ()) };
});

const TEST_PORT = 5555;

let server;
beforeAll(async () => {
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      resolve();
    });
  });

  await MockUpstashRedis.flushall();
});

afterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));

  await MockUpstashRedis.flushall();
});

module.exports = { TEST_PORT };
