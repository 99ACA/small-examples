import { redisConnPool as redisPool } from "./redis-connection-pool";
import * as Redis from 'ioredis'
import { v4 as uuid } from 'uuid'

class RedisDL {

    async executeLuaScript(lua: string, numberOfKeys: number, ...args) {
        let name = uuid()
        let client: Redis.Redis = undefined
        try {
            client = await redisPool.acquire()
            client.defineCommand(name, {
                numberOfKeys,
                lua
            })
            return await client[name](...args)
        } finally {
            client && redisPool.release(client)
        }
    }

    async getValue(keyName: string): Promise<string> {
        let client: Redis.Redis = undefined
        try {
            client = await redisPool.acquire()
            let res = await client.get(keyName)
            return res
        } finally {
            if (client) {
                redisPool.release(client)
            }
        }
    }
    async setKey(keyName: string, keyValue: Redis.ValueType): Promise<boolean> {
        let client: Redis.Redis = undefined
        try {
            client = await redisPool.acquire()
            let res: string = await client.set(keyName, keyValue)
            return res == "OK"
        } finally {
            client && redisPool.release(client)
        }
    }
    public deleteKeys = async (pattern: string) => {

        let client: Redis.Redis = undefined
        try {
            client = await redisPool.acquire()

            let promiseDelete = new Promise((resolve, reject) => {
                const stream = client.scanStream({ match: pattern })
                stream.on("data", (keys: string[]) => {
                    if (keys.length) {
                        const pipeline = client.pipeline()
                        keys.forEach((key) => {
                            pipeline.del(key)
                        });
                        pipeline.exec()
                    }
                })
                stream.on("end", () => { resolve() })
                stream.on("error", (e) => { reject(e) })
            })
            return await promiseDelete
        } finally {
            client && redisPool.release(client)
        }
    }
    public getKeys = async (pattern: string): Promise<string[]> => {
        let client: Redis.Redis = undefined

        try {
            client = await redisPool.acquire()

            return await (new Promise((resolve, reject) => {
                let values: string[] = []
                const stream = client.scanStream({
                    match: pattern
                });
                stream.on("data", (keys: string[]) => {
                    if (keys.length) {
                        keys.forEach((key) => {
                            values.push(key)
                        });
                    }
                });
                stream.on("end", () => {
                    resolve(values)
                });
                stream.on("error", (e) => {
                    reject(e)
                });
            }))
        } finally {
            client && redisPool.release(client)
        }
    }
    async setHashKey(keyName: string, keyValue: Object): Promise<boolean> {
        let client: Redis.Redis = undefined
        try {
            client = await redisPool.acquire()
            const pipeline = client.pipeline()
            Object.getOwnPropertyNames(keyValue).forEach(value => {
                pipeline.hset(keyName, value, keyValue[value])
            })
            await pipeline.exec()
            return true
        } finally {
            client && redisPool.release(client)
        }
    }
    async getHashAll(keyName: string): Promise<Record<string, string>> {
        let client: Redis.Redis = undefined
        try {
            client = await redisPool.acquire()
            return await client.hgetall(keyName)
        } finally {
            client && redisPool.release(client)
        }
    }
}

export const redisDL = new RedisDL()