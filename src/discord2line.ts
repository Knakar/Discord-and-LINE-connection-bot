import {Request, Response, NextFunction} from "express";
import {Client, Events, GatewayIntentBits, Message, OmitPartialGroupDMChannel, Snowflake} from "discord.js";

import {markError, markSuccess} from "./discord2line/discord";
import {createDeliveryBroadcastMessage, createDeliveryPushMessage} from "./discord2line/message";
import {sendBroadcastMessage, sendPushMessage} from "./discord2line/line";

import * as dotenv from "dotenv";
dotenv.config();


export async function discord2line(request: Request, response: Response, next: NextFunction) {
    const discordCli = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    })
    await discordCli.login(process.env.DISCORD_API_TOKEN);

    const sendPushMessageListener = createSendPushMessageListener("1315557387083710474") // #line通知
    const sendForwardChannelMessageListener = createForwardChannelMessageListener("1086956697513365585")
    // Narrow cast Reply
    discordCli.on(Events.MessageCreate, sendPushMessageListener);
    // Forward Notification
    discordCli.on(Events.MessageCreate, sendForwardChannelMessageListener)

    response.status(200).send()
    // set Timer
    await new Promise<void>((resolve) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if(Date.now() - startTime > 5 * 60 * 1000 && Date.now()) {
                clearInterval(interval);
                discordCli.destroy()
                resolve();
            }
        }, 1000);
    })
}

function createSendPushMessageListener(channelId: Snowflake){
    return async (message: OmitPartialGroupDMChannel<Message>) => {
        if (message.channelId !== channelId){
            return
        }
        if (message.author.bot) return;
        if (!message.reference){
            await message.reply("メッセージに返信してください");
            await markError(message);
            return;
        }
        const deliveryMessage = await createDeliveryPushMessage(message)
        try {
            await sendPushMessage(deliveryMessage);
            await markSuccess(message);
        }catch (error){
            console.error(error)
            await markError(message)
        }
    }
}
function createForwardChannelMessageListener(channelId: Snowflake){
    return async (message: OmitPartialGroupDMChannel<Message>) => {
        if (message.channelId !== channelId){
            return
        }
        const deliveryMessage = await createDeliveryBroadcastMessage(message)
        try {
            await sendBroadcastMessage(deliveryMessage)
            await markSuccess(message)
        }catch (error){
            console.error(error)
            await markError(message)
        }
    }
}