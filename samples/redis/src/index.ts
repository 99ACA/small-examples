import { luaExamples } from "./example-lua"
import { redisConnPool } from "./provider/redis-connection-pool"
import { redisDL } from "./provider/redis-data-layer"

async function test() {
    //Set & Get 
    const keyName = "MyKey"
    await redisDL.setKey(keyName, '{"a":5}')
    let res = await redisDL.getValue(keyName)
    console.log(`Set/Get Key Result: ${JSON.stringify(res)}`)


    await redisDL.setKey(keyName, 100)
    res = await redisDL.getValue(keyName)
    console.log(`Set/Get Number Result: ${res}`)

    //Not exist
    res = await redisDL.getValue("xxxx")
    console.log(`Result: ${res ?? 'Not exist'}`)

    //Get List of keys
    let resList: string[] = await redisDL.getKeys("my*")
    console.log(`Get list of keys (Regex) Result: (${resList.length}) ${resList}`)

    //Set/Get Hash 
    await redisDL.setHashKey("user-name", { name: "bob", email: "bob@email.com", age: 32 })
    let resRecoredList = await redisDL.getHashAll("user-name")
    console.log(`Set/Get Hash Result (As Object): ${JSON.stringify(resRecoredList)} `)

    await luaExamples()
}


test().then(() => {
    // Close the connection pool
    redisConnPool.drain().then(() => { redisConnPool.clear() })
})


