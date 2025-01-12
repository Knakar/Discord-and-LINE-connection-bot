import {messagingApi, WebhookEvent} from "@line/bot-sdk";
import {RESTPostAPIWebhookWithTokenJSONBody as DiscordWebhookBody, APIEmbed} from "discord-api-types/v10";
import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config()
const DATA_API_PREFIX = "https://api-data.line.me/v2/bot/message/"

export async function createResponseMessage(lineEvents: Array<WebhookEvent>) {
	let results = new Array<DiscordWebhookBody>()
	const line_cli = new messagingApi.MessagingApiClient({
		channelAccessToken: process.env.LINE_API_TOKEN??""
	})
	for (const event of lineEvents) {
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
			const response: DiscordWebhookBody = {
				content: "",
				embeds: [createResponseEmbedMessage("Message", userDisplayName, userId, quoteToken, datetime, message)]
			}
			results.push(response)
		}
	}
	return results
}

function createResponseEmbedMessage(eventType: string, userName: string, userId: string|undefined, token: string|undefined, timestamp: string, message: string|null):APIEmbed {
	const response: APIEmbed ={
		title: eventType,
		color: 0x06C755,  // LINE Forest Green
		fields: []
	}
	response.fields?.push({
		name: "From",
		value: userName,
		inline: true
	}, {
		name: "User ID",
		value: (userId)? userId: "",
		inline: true
	})
	if (token){
		response.fields?.push({
			name: "Token",
			value: token,
			inline: true
		})
	}
	response.fields?.push({
		name: "Received at",
		value: timestamp
	})
	if (message){
		response.fields?.push({
			name: "Content",
			value: message
		})
	}
	return response
}
