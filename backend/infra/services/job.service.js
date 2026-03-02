const CacheProvider = require('@providers/cache.provider');
const NotionProvider = require('@providers/notion.provider');
const JobRepository = require('@repositories/job.repository');
const { Error404NotFound } = require('@utilities/errors');

class JobService {
  static CACHE_PREFIX = 'jobs';
  static CACHE_TTL = 900; // 15 minutes in seconds

  static fetchAll = async () => {
    const cacheKey = `${this.CACHE_PREFIX}:all`;
    return await CacheProvider.getOrSet(
      cacheKey,
      async () => await JobRepository.findAll(),
      this.CACHE_TTL
    );
  };

  static fetchByStatus = async (status) => {
    const cacheKey = `${this.CACHE_PREFIX}:status:${status}`;
    return await CacheProvider.getOrSet(
      cacheKey,
      async () => await JobRepository.findByStatus(status),
      this.CACHE_TTL
    );
  };

  static fetchOpen = async () => {
    const cacheKey = `${this.CACHE_PREFIX}:status:OPEN`;
    return await CacheProvider.getOrSet(
      cacheKey,
      async () => await JobRepository.findByStatus('OPEN'),
      this.CACHE_TTL
    );
  };

  static fetchById = async (id) => {
    const cacheKey = `${this.CACHE_PREFIX}:id:${id}`;
    const job = await CacheProvider.getOrSet(
      cacheKey,
      async () => await JobRepository.findById(id),
      this.CACHE_TTL
    );
    if (!job) throw new Error404NotFound('Job listing not found');
    return job;
  };

  static fetchByRoleType = async (roleType) => {
    const cacheKey = `${this.CACHE_PREFIX}:roleType:${roleType}`;
    return await CacheProvider.getOrSet(
      cacheKey,
      async () => await JobRepository.findByRoleType(roleType),
      this.CACHE_TTL
    );
  };

  static invalidateCache = async () => {
    await CacheProvider.invalidate(`${this.CACHE_PREFIX}:*`);
    NotionProvider.clearMetaCache();
  };
}

module.exports = JobService;
