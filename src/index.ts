import {receiveLineMessage} from "./line";
import {send_discord_messages} from "./discord";
import {createResponseMessage} from "./message";


export default {
	async fetch(request, env, ctx) {
		const line_events = await receiveLineMessage(request, env)
		const send_messages = await createResponseMessage(line_events, env)
		await send_discord_messages(send_messages, env)
		return new Response("", {
			status: 200
		})
	},
} satisfies ExportedHandler<Env>;
