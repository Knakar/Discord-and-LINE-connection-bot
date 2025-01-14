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
		const datetime = new Date(event.timestamp).toLocaleString('ja-JP')
		if (event.type === "message") {
			const userId = event.source.userId
			const embedFieldOptions: Partial<EmbedFieldOptions> = {};
			embedFieldOptions.userName = (await line_cli.getProfile(typeof userId === "string" ? userId : "")).displayName
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
			let attachment: AttachmentBuilder|undefined
			switch (event.message.type) {
				case "text":
					embedFieldOptions.token = event.message.quoteToken
					embedFieldOptions.message = event.message.text
					break;
				case "image":
					attachment = await getAttachmentData(event.message.id);
					break;
				case "video":
					embedFieldOptions.token = event.message.quoteToken
				case "audio":
					if (event.message.contentProvider.type === "external") {
						embedFieldOptions.link = event.message.contentProvider.originalContentUrl
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
				embeds: [createResponseEmbedMessage("Message", userId??"", datetime, embedFieldOptions)]
			}
			if (attachment){
				response.files = [attachment]
			}
			results.push(response)
		}
	}
	return results
}

function createResponseEmbedMessage(eventType: string, userId: string, timestamp: string, options: Partial<EmbedFieldOptions>):APIEmbed {
	const response: APIEmbed = {
		title: eventType,
		color: 0x06C755,  // LINE Forest Green
		fields: []
	}
	response.fields?.push({
		name: "From",
		value: options.userName??"",
		inline: true
	}, {
		name: "User ID",
		value: userId,
		inline: true
	})
	if (options.token) {
		response.fields?.push({
			name: "Token",
			value: options.token,
			inline: true
		})
	}
	response.fields?.push({
		name: "Sent at",
		value: timestamp
	})
	if (options.message) {
		response.fields?.push({
			name: "Content",
			value: options.message
		})
	}
	if (options.link) {
		response.fields?.push({
			name: "Link",
			value: options.link
		})
	}
	return response
}

type EmbedFieldOptions = {
	userName: string,
	token: string,
	message: string,
	link: string
}