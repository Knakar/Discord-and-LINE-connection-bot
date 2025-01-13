import {messagingApi, WebhookEvent} from "@line/bot-sdk";
import {APIEmbed} from "discord-api-types/v10";
import {setTimeout} from "node:timers/promises";
import * as dotenv from "dotenv";
import mime from "mime";
import {
	AttachmentBuilder,
	MessageCreateOptions,
} from "discord.js";

dotenv.config()

export async function createResponseMessage(lineEvents: Array<WebhookEvent>) {
	let results = new Array<MessageCreateOptions>()
	const line_cli = new messagingApi.MessagingApiClient({
		channelAccessToken: process.env.LINE_API_TOKEN??""
	})
	const line_blob_cli = new messagingApi.MessagingApiBlobClient({
		channelAccessToken: process.env.LINE_API_TOKEN??""
	})
	for (const event of lineEvents) {
		const datetime = new Date(event.timestamp * 1000).toLocaleString('ja-JP')
		if (event.type === "message") {
			const userId = event.source.userId
			const userDisplayName = (await line_cli.getProfile(typeof userId === "string" ? userId : "")).displayName
			const getAttachmentDataTranscoding =  async (messageId: string) : Promise<AttachmentBuilder|undefined>=> {
				return line_blob_cli.getMessageContentTranscodingByMessageId(messageId).then(async response => {
					if (response.status === "processing") {
						await setTimeout(60 * 1000)
						return getAttachmentDataTranscoding(messageId)
					}else if (response.status === "succeeded") {
						return getAttachmentData(messageId)
					}else{
						return undefined
					}
				})
			}
			const getAttachmentData = async (messageId: string): Promise<AttachmentBuilder|undefined> => {
				return line_blob_cli.getMessageContentWithHttpInfo(messageId).then(response => {
					if(response.httpResponse.ok){
						const contentType = response.httpResponse.headers.get("content-type")
						const contentData = response.body
						return new AttachmentBuilder(contentData, {
							name: "attachment." + mime.extension(contentType ?? "text/plain"),
						})
					}
					return undefined
				})
			}
			let quoteToken: string | undefined
			let message = ""
			let attachmentLink: string | undefined
			let attachment: AttachmentBuilder|undefined
			switch (event.message.type) {
				case "text":
					quoteToken = event.message.quoteToken
					message = event.message.text
					break;
				case "image":
					attachment = await getAttachmentData(event.message.id);
					break;
				case "video":
					quoteToken = event.message.quoteToken
				case "audio":
					if (event.message.contentProvider.type === "external") {
						attachmentLink = event.message.contentProvider.originalContentUrl
					} else if (event.message.contentProvider.type === "line") {
						attachment = await getAttachmentDataTranscoding(event.message.id)
					}
					break;
				case "file":
					attachment = await getAttachmentData(event.message.id);
					break
				default:
					break;

			}
			const response: MessageCreateOptions = {
				embeds: [createResponseEmbedMessage("Message", userDisplayName, userId, quoteToken, datetime, message, attachmentLink)]
			}
			if (attachment){
				response.files = [attachment]
			}
			results.push(response)
		}
	}
	return results
}

function createResponseEmbedMessage(eventType: string, userName: string, userId: string|undefined, token: string|undefined, timestamp: string, message: string|null, link: string|undefined):APIEmbed {
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
		name: "Sent at",
		value: timestamp
	})
	if (message){
		response.fields?.push({
			name: "Content",
			value: message
		})
	}
	if (link){
		response.fields?.push({
			name: "Link",
			value: link
		})
	}
	return response
}
