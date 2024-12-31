import crypto from "node:crypto";
import {
	LINE_SIGNATURE_HTTP_HEADER_NAME,
	SignatureValidationFailed,
	WebhookEvent,
	WebhookRequestBody
} from "@line/bot-sdk";



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
