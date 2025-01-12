import crypto from "node:crypto";
import dotenv from "dotenv";
dotenv.config()
import {
	LINE_SIGNATURE_HTTP_HEADER_NAME,
	SignatureValidationFailed,
	WebhookRequestBody
} from "@line/bot-sdk";
import {Request} from "express";


export async function receiveLineMessage(request: Request) {
	const header_signature = request.headers[LINE_SIGNATURE_HTTP_HEADER_NAME]?.toString()
	const body: WebhookRequestBody = request.body
	if (!header_signature) {
		console.error("HEADER IS NONE")
		throw SignatureValidationFailed
	}
	if (!check_signature(JSON.stringify(body), header_signature)) {
		console.error("HEDER SIGNATURE WAS WRONG:")
		throw SignatureValidationFailed
	}
	return body.events;
}

function check_signature(body: string, header_signature: string): boolean {
	const secret_key = process.env.LINE_WEBHOOK_SECRETKEY
	if (secret_key !== undefined) {
		const body_signature = crypto.createHmac("SHA256", secret_key)
			.update(body)
			.digest("base64")
		return header_signature === body_signature
	}
	console.error("ENV FILE COULD NOT LOAD")
	return false;
}
