import crypto from "node:crypto";
import {
	LINE_SIGNATURE_HTTP_HEADER_NAME,
	SignatureValidationFailed,
	WebhookEvent,
	WebhookRequestBody
} from "@line/bot-sdk";
import * as path from "node:path";


const DATA_API_PREFIX = "https://api-data.line.me/v2/bot/message/"

export async function receiveLineMessage(request: Request<unknown, CfProperties<unknown>>, env: Env) {
	const header_signature = request.headers.get(LINE_SIGNATURE_HTTP_HEADER_NAME)
	const body: WebhookRequestBody = await request.json()
	if (!header_signature) {
		console.error("HEADER IS NONE")
		throw SignatureValidationFailed
	}
	if (!check_signature(JSON.stringify(body), header_signature, env)) {
		console.error("HEDER SIGNATURE WAS WRONG:")
		throw SignatureValidationFailed
	}
	return body.events;
}

function check_signature(body: string, header_signature: string, env: Env): boolean {
	const secret_key = env.LINE_WEBHOOK_SECRETKEY
	if (secret_key !== undefined) {
		const body_signature = crypto.createHmac("SHA256", secret_key)
			.update(body)
			.digest("base64")
		return header_signature === body_signature
	}
	console.error("ENV FILE COULD NOT LOAD")
	return false;
}

export function makeResponseMessage(line_events: Array<WebhookEvent>): Array<string> {
	console.log(line_events)
	let results = new Array<string>()
	line_events.forEach((event) => {
		const datetime = new Date(event.timestamp * 1000).toLocaleString('ja-JP')
		if (event.type === "message") {
			const userId = event.source.userId
			const replyToken = event.replyToken
			let quoteToken: string | undefined
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
					message = path.join(DATA_API_PREFIX, event.message.id, "content").toString()
				default:
					break;

			}
			let response_message = ""
			if (quoteToken) {
				response_message += "Token: " + quoteToken + "\n"
			}
			response_message += "at: " + datetime + "\n"
			response_message += "from: " + userId + "\n"
			response_message += message
			results.push(response_message)
		}
	})
	return results
}
