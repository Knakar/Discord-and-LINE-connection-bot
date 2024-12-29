import {WebhookRequestBody} from "@line/bot-sdk"
import * as crypto from "node:crypto";
import * as dotenv from "dotenv"
import {GetWebhookEndpointResponse} from "@line/bot-sdk/dist/messaging-api/model/getWebhookEndpointResponse";
dotenv.config({path: "../.env"})
export function check_signature(body: GetWebhookEndpointResponse, header_signature: string): boolean{
    const secret_key = process.env.LINE_WEBHOOK_SECRETKEY
    if (secret_key!==undefined){
        const body_signature = crypto.createHmac("SHA256", secret_key)
            .update(body.endpoint)
            .digest("base64")
        return header_signature===body_signature
    }
    console.log("env file was not loaded")
    return false;
}
