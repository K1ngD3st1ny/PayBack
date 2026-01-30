const Redis = require('ioredis');

const redisConfig = process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
};

// Initialize with lazyConnect to prevent immediate crash
const redis = new Redis({
    ...redisConfig,
    lazyConnect: true,
    retryStrategy: (times) => {
        // Retry every 5 seconds, up to 3 times then stop? 
        // Or keep retrying but slowly.
        return 5000;
    }
});

// Suppress default error logging to avoid spam
redis.on('error', (err) => {
    // console.warn('Redis error:', err.message); 
});

// Attempt to connect
redis.connect().catch(() => {
    console.log('Redis connection failed. Caching will be disabled.');
});

// Safe wrapper
const safeRedis = {
    get: async (...args) => {
        if (redis.status !== 'ready') return null;
        try {
            return await redis.get(...args);
        } catch (e) {
            return null;
        }
    },
    set: async (...args) => {
        if (redis.status !== 'ready') return;
        try {
            await redis.set(...args);
        } catch (e) { }
    },
    del: async (...args) => {
        if (redis.status !== 'ready') return;
        try {
            await redis.del(...args);
        } catch (e) { }
    }
};

module.exports = safeRedis;
