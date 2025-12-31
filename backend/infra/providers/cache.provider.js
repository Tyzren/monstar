const { Redis } = require('@upstash/redis');

const redis =
  process.env.MONSTAR_SERVERLESS_CACHE_KV_REST_API_URL &&
  process.env.MONSTAR_SERVERLESS_CACHE_KV_REST_API_TOKEN
    ? new Redis({
        url: process.env.MONSTAR_SERVERLESS_CACHE_KV_REST_API_URL,
        token: process.env.MONSTAR_SERVERLESS_CACHE_KV_REST_API_TOKEN,
      })
    : null;

class CacheProvider {
  static CLIENT = redis;
  static POPULAR_UNITS_TTL = 604800; // 1 week

  /**
   * Get cached data or fetch from source
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if cache misses
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   */
  static async getOrSet(key, fetchFn, ttl = 3600) {
    if (!this.CLIENT) {
      if (process.env.NODE_ENV !== 'test')
        console.warn('Redis not configured, fetching directly');
      return await fetchFn();
    }

    try {
      const cached = await redis.get(key);
      if (cached !== null) {
        return cached;
      }

      const data = await fetchFn();

      await redis.setex(key, ttl, JSON.stringify(data));

      return data;
    } catch (err) {
      console.error('Redis error:', err);
      return await fetchFn();
    }
  }

  /**
   * Invalidate cache by key or pattern
   */
  static async invalidate(keyOrPattern) {
    if (!redis) return;

    try {
      if (keyOrPattern.includes('*')) {
        const keys = await redis.keys(keyOrPattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        await redis.del(keyOrPattern);
      }
    } catch (err) {
      console.error('Cache invalidation error', err);
    }
  }
}

module.exports = CacheProvider;
