import crypto from "node:crypto";
import dotenv from "dotenv"
import {LINE_SIGNATURE_HTTP_HEADER_NAME, SignatureValidationFailed, WebhookRequestBody} from "@line/bot-sdk";
dotenv.config({path: "../.env"})

export async function receiveLineMessage(request: Request<unknown, CfProperties<unknown>>){
	const header_signature = request.headers.get(LINE_SIGNATURE_HTTP_HEADER_NAME)
	const body:WebhookRequestBody = await request.json()
	if (!header_signature){
		throw SignatureValidationFailed
	}
	if (!check_signature(body.toString(), header_signature)){
		throw SignatureValidationFailed
	}
	return body.events;
}

function check_signature(body: string, header_signature: string): boolean{
    const secret_key = process.env.LINE_WEBHOOK_SECRETKEY
    if (secret_key!==undefined){
        const body_signature = crypto.createHmac("SHA256", secret_key)
            .update(body)
            .digest("base64")
        return header_signature===body_signature
    }
    return false;
}
