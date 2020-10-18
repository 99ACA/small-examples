import { redisConnPool } from "./provider/redis-connection-pool"
import { redisDL } from "./provider/redis-data-layer"
import * as Redis from 'ioredis'

const LuaScript = {
    script_example: {
        lua: 'if redis.call("EXISTS", KEYS[1]) == 1 then \
                return redis.call("INCR", KEYS[1]) \
              else \
                return nil \
              end',
        numberOfKeys: 1
    },
    script_2FG_Keys: {
        lua: 'if redis.call("EXISTS", KEYS[1]) == 1 then \
                local key = redis.call("GET", KEYS[1]) \
                return redis.call("GET", key) \
              else \
                return nil \
              end',
        numberOfKeys: 1
    }
}

async function keys2Value(keyName: string, secondKeyName: string, value: string) {
    let client: Redis.Redis = undefined
    try {
        client = await redisConnPool.acquire()
        const pipeline = client.pipeline()
        pipeline.set(keyName, value)
        pipeline.set(secondKeyName, keyName)
        await pipeline.exec()
    } finally {
        client && redisConnPool.release(client)
    }
}

async function secondKeyGetValue_test() {
    await keys2Value("user-by-name", "user-by-email", "user-is-value-name")

    let res = await redisDL.executeLuaScript(LuaScript.script_2FG_Keys.lua, LuaScript.script_2FG_Keys.numberOfKeys, "user-by-email")
    console.log(`Script Result:  ${res}`)
}

async function example1() {
    //Run script
    let res = await redisDL.executeLuaScript("return ARGV[1]..' '..ARGV[2]..' -> key is: '..KEYS[1]", 1, "name:first", "Hi", "there")
    console.log(`Script Result:  ${res}`)
}

export async function luaExamples() {
    await example1()
    await secondKeyGetValue_test()
}