import {messagingApi, WebhookEvent} from "@line/bot-sdk";
import path from "node:path";
import * as events from "node:events";

const DATA_API_PREFIX = "https://api-data.line.me/v2/bot/message/"

export async function makeResponseMessage(line_events: Array<WebhookEvent>, env: Env): Promise<Array<Record<string, string>>> {
	let results = new Array<Record<string, string>>()
	const line_cli = new messagingApi.MessagingApiClient({
		channelAccessToken: env.LINE_API_TOKEN
	})
	for (const event of line_events) {
		const datetime = new Date(event.timestamp * 1000).toLocaleString('ja-JP')
		if (event.type === "message") {
			const userId = event.source.userId
			const userDisplayName = (await line_cli.getProfile(typeof userId === "string" ? userId : "")).displayName
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
			response_message += "from: " + userDisplayName + "(" + userId + ")\n"
			response_message += message
			results.push({content: response_message})
		}
	}
	return results
}
