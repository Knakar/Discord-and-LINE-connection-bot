/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {receiveLineMessage, makeResponseMessage} from "./line";
import {send_discord_messages} from "./discord";

export default {
	async fetch(request, env, ctx) {
		const line_events = await receiveLineMessage(request)
		const send_messages = makeResponseMessage(line_events)
		send_discord_messages(send_messages)
		return new Response("", {
			status: 201
		})
	},
} satisfies ExportedHandler<Env>;
