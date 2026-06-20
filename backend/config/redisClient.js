const redis = require('redis');

let client = null;
let isRedisAvailable = false;

// Simple in-memory fallback cache to mimic Redis GET, SETEX, and DEL
const memoryStore = new Map();
const memoryExpiry = new Map();

const memoryCache = {
  get: async (key) => {
    const expiresAt = memoryExpiry.get(key);
    if (expiresAt && Date.now() > expiresAt) {
      memoryStore.delete(key);
      memoryExpiry.delete(key);
      return null;
    }
    return memoryStore.get(key) || null;
  },
  setEx: async (key, seconds, value) => {
    memoryStore.set(key, value);
    memoryExpiry.set(key, Date.now() + seconds * 1000);
    return 'OK';
  },
  del: async (key) => {
    const deleted = memoryStore.delete(key);
    memoryExpiry.delete(key);
    return deleted ? 1 : 0;
  }
};

const connectRedis = async () => {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = process.env.REDIS_PORT || 6379;
  
  client = redis.createClient({
    url: `redis://${host}:${port}`,
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: (retries) => {
        if (retries > 2) {
          console.warn('🔌 Redis reconnection failed twice. Switching permanently to memory fallback.');
          isRedisAvailable = false;
          return new Error('Redis down');
        }
        return 1000; // Try reconnecting in 1s
      }
    }
  });

  client.on('error', (err) => {
    // Suppress console flood, log once
    if (isRedisAvailable) {
      console.warn('⚠️ Redis error detected. Fallback cache is active.');
      isRedisAvailable = false;
    }
  });

  client.on('connect', () => {
    console.log('🚀 Redis Client Connected successfully.');
    isRedisAvailable = true;
  });

  try {
    await client.connect();
  } catch (err) {
    console.warn('⚠️ Redis not available at startup. In-memory cache fallback initialized.');
    isRedisAvailable = false;
  }
};

// Initialize connection (errors handled gracefully internally)
connectRedis();

module.exports = {
  get: async (key) => {
    if (isRedisAvailable && client && client.isOpen) {
      try {
        return await client.get(key);
      } catch (err) {
        return await memoryCache.get(key);
      }
    }
    return await memoryCache.get(key);
  },
  setEx: async (key, seconds, value) => {
    if (isRedisAvailable && client && client.isOpen) {
      try {
        return await client.setEx(key, seconds, value);
      } catch (err) {
        return await memoryCache.setEx(key, seconds, value);
      }
    }
    return await memoryCache.setEx(key, seconds, value);
  },
  del: async (key) => {
    if (isRedisAvailable && client && client.isOpen) {
      try {
        return await client.del(key);
      } catch (err) {
        return await memoryCache.del(key);
      }
    }
    return await memoryCache.del(key);
  },
  isRedisAvailable: () => isRedisAvailable
};
