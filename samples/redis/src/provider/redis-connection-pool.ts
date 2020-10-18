import * as Redis from 'ioredis'
import { RedisOptions } from 'ioredis'
import * as GenericPool from 'generic-pool'

const REDISConfig: RedisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    // connectTimeout: 50000,
    maxRetriesPerRequest: 4,
    retryStrategy: (times) => Math.min(times * 30, 1000),
    showFriendlyErrorStack: true,
    keyPrefix: process.env.REDIS_PREFIX
}

const RedisFactory = {
    create(): Promise<Redis.Redis> {
        return new Promise(function createRedis(resolve, reject) {
            const ioredis = new Redis(REDISConfig);
            ioredis
                .on('error', function (err) {
                    reject(err);
                })
                .on('ready', function () {
                    resolve(ioredis);
                })
        });
    },
    destroy(ioredis: Redis.Redis): Promise<void> {
        return new Promise((resolve) => {
            ioredis
                .on('close', function (err) {
                    err && console.error(err)
                })
                .on('end', function () {
                    resolve();
                })
                .disconnect();
        });
    }
}

export const redisConnPool = GenericPool.createPool<Redis.Redis>(RedisFactory, {
    max: process.env.REDIS_POOL_MAX && Number(process.env.REDIS_POOL_MAX) ? Number(process.env.REDIS_POOL_MAX) : 10,
    min: process.env.REDIS_POOL_MIN && Number(process.env.REDIS_POOL_MIN) ? Number(process.env.REDIS_POOL_MIN) : 2
})