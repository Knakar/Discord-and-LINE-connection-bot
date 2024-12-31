import {setTimeout} from "node:timers/promises"
export async function send_discord_messages(messages: Array<string>, env: Env){

	const DISCORD_WEBHOOK_URL = env.DISCORD_WEBHOOK_LINK
	if (DISCORD_WEBHOOK_URL){
		for (const message of messages){
			console.log(JSON.stringify({content: message}))
			const response = await fetch(DISCORD_WEBHOOK_URL,{
				method: "POST",
				headers: {
		          "Content-Type": "application/json;charset=UTF-8"
				},
				body: JSON.stringify({content: message})
			})
			if(!response.ok){
				console.error(response.status.toString(), message)
			}
			await setTimeout(50)
		}
	}else{
		console.error("ENVFILE HAS NOT LOADED")
	}
}
