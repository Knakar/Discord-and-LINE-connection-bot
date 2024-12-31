import {setTimeout} from "node:timers/promises"
export async function send_discord_messages(contents: Array<Record<string, unknown>>, env: Env){

	const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_LINK
	if (DISCORD_WEBHOOK_URL){
		for (const content of contents){
			const response = await fetch(DISCORD_WEBHOOK_URL,{
				method: "POST",
				headers: {
		          "Content-Type": "application/json;charset=UTF-8"
				},
				body: JSON.stringify(content)
			})
			if(!response.ok){
				console.error(response.status.toString(), content)
			}
			await setTimeout(50)
		}
	}else{
		console.error("ENVFILE HAS NOT LOADED")
	}
}
