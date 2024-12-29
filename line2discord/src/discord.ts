import {setTimeout} from "node:timers/promises"
import * as dotenv from "dotenv";
dotenv.config({path: "../.env"})
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_LINK
export async function send_discord_messages(messages: Array<string>){
	if (DISCORD_WEBHOOK_URL){
		for (const message of messages){
			fetch(DISCORD_WEBHOOK_URL,{
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: message
			}).then((response)=>{
				if(!response.ok){
					console.error("Cannot send discord:", message)
				}
			})
			await setTimeout(50)
		}
	}else{
		console.error("ENVFILE HAS NOT LOADED")
	}
}
