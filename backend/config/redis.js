const Redis = require('ioredis');

const redisOptions = {
    lazyConnect: true,
    retryStrategy: (times) => {
        // Retry every 5 seconds
        return 5000;
    }
};

let redis;
if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, redisOptions);
} else {
    const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
    };
    redis = new Redis({
        ...redisConfig,
        ...redisOptions
    });
}

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
