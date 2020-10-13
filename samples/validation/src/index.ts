import { IncomingRequest } from "./schema";
import { validator } from "./provider/validator";
import { v4 as uuidv4 } from 'uuid'


async function test() {
    let res = await validator(IncomingRequest, { action: "Sample", correlationId: uuidv4(), publish: { type: "s3", name: "bucket-name", region: "us-east-2", location: "object-folder" }, payload: {} })
    console.log(`Result: ${JSON.stringify(res)}`)

    res = await validator(IncomingRequest, { action: "Sample", correlationId: uuidv4(), publish: { type: "sqs", name: "queue-name" }, payload: {} })
    console.log(`Result: ${JSON.stringify(res)}`)
}

test()