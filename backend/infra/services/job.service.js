const JobRepository = require('@repositories/job.repository');
const CacheProvider = require('@providers/cache.provider');
const NotionProvider = require('@providers/notion.provider');
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
}