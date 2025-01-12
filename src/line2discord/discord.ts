import {setTimeout} from "node:timers/promises"
import {RESTPostAPIWebhookWithTokenJSONBody as DiscordWebhookBody} from "discord-api-types/v10";
import * as dotenv from 'dotenv';
import {MessageCreateOptions, MessagePayloadOption, WebhookClient} from "discord.js";
dotenv.config()

export async function send_discord_messages(contents: Array<MessageCreateOptions>){
	const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_LINK
	if (DISCORD_WEBHOOK_URL){
		const discord_webhook_cli = new WebhookClient({
			url: DISCORD_WEBHOOK_URL,
		})
		for (const content of contents){
			await discord_webhook_cli.send(content)
			await setTimeout(50)
		}
	}else{
		console.error("ENVFILE HAS NOT LOADED")
	}
}
