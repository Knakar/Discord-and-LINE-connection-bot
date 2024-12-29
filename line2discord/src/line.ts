import crypto from "node:crypto";
import dotenv from "dotenv"
import {
	LINE_SIGNATURE_HTTP_HEADER_NAME,
	SignatureValidationFailed,
	WebhookEvent,
	WebhookRequestBody
} from "@line/bot-sdk";
import * as path from "node:path";
dotenv.config({path: "../.env"})
const DATA_API_PREFIX = "https://api-data.line.me/v2/bot/message/"

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

export function makeResponseMessage(line_events: Array<WebhookEvent>): Array<string>{
	let results = new Array<string>()
	line_events.forEach((event) => {
		if (event.type in ["message", "unsend"]){
			const datetime = new Date(event.timestamp * 1000).toLocaleString('ja-JP')
			if (event.type === "message"){
				const userId = event.source.userId
				const replyToken = event.replyToken
				let quoteToken:string|undefined
				let message = ""
				switch (event.message.type) {
					case "text":
						quoteToken = event.message.quoteToken
						message = event.message.text
						break;
					case "image":
					case "video":
						quoteToken = event.message.quoteToken
					case "audio":
						if (event.message.contentProvider.type === "external") {
							message = event.message.contentProvider.originalContentUrl
						} else if (event.message.contentProvider.type === "line") {
							message = path.join(DATA_API_PREFIX, event.message.id, "content").toString()
						}
						break;
					case "file":
						message =path.join(DATA_API_PREFIX, event.message.id, "content").toString()
					default:
						break;

				}
				let response_message = ""
				if (quoteToken){
					response_message += "Token: " + quoteToken + "\n"
				}
				response_message += datetime + "\n"
				response_message += "from: " + userId + "\n"
				response_message += message

				results.push(response_message)
			}
		}
	})
	return results
}
