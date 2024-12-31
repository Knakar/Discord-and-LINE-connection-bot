import {WebhookEvent} from "@line/bot-sdk";
import path from "node:path";

const DATA_API_PREFIX = "https://api-data.line.me/v2/bot/message/"
export function makeResponseMessage(line_events: Array<WebhookEvent>): Array<Record<string, string>> {
	let results = new Array<Record<string, string>>()
	line_events.forEach((event) => {
		const datetime = new Date(event.timestamp * 1000).toLocaleString('ja-JP')
		if (event.type === "message") {
			const userId = event.source.userId
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
			results.push({content: message})
		}
	})
	return results
}
