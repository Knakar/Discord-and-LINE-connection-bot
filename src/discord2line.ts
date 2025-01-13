import {Request, Response, NextFunction} from "express";
import {Client, Message, OmitPartialGroupDMChannel, Snowflake} from "discord.js";
import {RequestError} from "@line/bot-sdk";

import {markError, markSuccess} from "./discord2line/discord";
import {createDeliveryBroadcastMessage, createDeliveryPushMessage} from "./discord2line/message";
import {sendBroadcastMessage, sendPushMessage} from "./discord2line/line";

import {setTimeout} from "node:timers/promises";
import * as dotenv from "dotenv";
dotenv.config();


export async function discord2line(request: Request, response: Response, next: NextFunction) {
    const discordCli = new Client({
        intents: []
    })
    await discordCli.login(process.env.DISCORD_API_TOKEN);

    const sendPushMessageListener = createSendPushMessageListener("1315557387083710474") // #line通知
    const sendForwardChannelMessageListener = createForwardChannelMessageListener("1086956697513365585")
    // Narrow cast Reply
    discordCli.on("messageCreate", sendPushMessageListener);
    // Forward Notification
    discordCli.on("messageCreate", sendForwardChannelMessageListener)

    // set Timer
    await setTimeout(5*60*1000, () => {
        discordCli.off("messageCreate", sendPushMessageListener);
        discordCli.off("messageCreate", sendForwardChannelMessageListener);
    })
    response.status(200).send("OK");
}

function createSendPushMessageListener(channelId: Snowflake){
    return (message: OmitPartialGroupDMChannel<Message>) => {
        if (message.channelId !== channelId){
            return
        }
        const deliveryMessage = createDeliveryPushMessage(message)
        try {
            sendPushMessage(deliveryMessage)
            markSuccess(message)
        }catch{
            markError(message)
        }
    }
}
function createForwardChannelMessageListener(channelId: Snowflake){
    return (message: OmitPartialGroupDMChannel<Message>) => {
        if (message.channelId !== channelId){
            return
        }
        const deliveryMessage = createDeliveryBroadcastMessage(message, channelId)
        try {
            sendBroadcastMessage(deliveryMessage)
            markSuccess(message)
        }catch (error){
            console.error(error)
            markError(message)
        }
    }
}