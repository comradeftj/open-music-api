const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });
    this._client.connect();
  }

  async set(key, value, expiredTime) {
    await this._client.set(key, value, {
      EX: expiredTime,
    });
  }

  async get(key) {
    const result = await this._client.get(key);
    if (result === null) throw new Error('Cache not found');

    return result;
  }

  delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;