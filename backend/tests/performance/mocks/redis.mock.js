const IORedis = require('ioredis-mock');
const mockRedisClient = new IORedis();

class MockUpstashRedis {
  constructor(config) {}

  async get(key) {
    const data = await mockRedisClient.get(key);
    try {
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return data;
    }
  }

  async setex(key, value, ttl) {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      return mockRedisClient.set(key, stringValue, 'EX', ttl);
    }

    return mockRedisClient.set(key, stringValue);
  }

  async del(...keys) {
    return mockRedisClient.del(...keys);
  }
  async keys(pattern) {
    return mockRedisClient.keys(pattern);
  }

  static async flushall() {
    return await mockRedisClient.flushall()
  }
}

module.exports = MockUpstashRedis;
