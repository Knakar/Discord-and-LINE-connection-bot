import {OmitPartialGroupDMChannel, Message as DiscordMessage, Snowflake, TextChannel} from "discord.js";
import {PushMessageRequest} from "@line/bot-sdk/dist/messaging-api/model/pushMessageRequest";

export function createDeliveryPushMessage(message: OmitPartialGroupDMChannel<DiscordMessage>): PushMessageRequest{}
export function createDeliveryBroadcastMessage(message: OmitPartialGroupDMChannel<DiscordMessage>,channelId: string): PushMessageRequest{}
function composeDeliveryMessageBase(message: OmitPartialGroupDMChannel<DiscordMessage>): string {
    const auther = message.author.username
    const date = message.createdAt.toLocaleDateString("ja-JP")
    const message_content = message.content
    let title: string;
    if (message.channel instanceof TextChannel) {
        title = message.channel.name + "in" + message.guild?.name
    }else {
        title = "Discord Message"
    }
    const attachments = message.attachments.map((attachment) =>{
        return attachment.url
    })
    let baseMassage = "";
    baseMassage += `[${title}]\n`
    baseMassage += `Author: ${auther}\n`
    baseMassage += `Received at: ${date}\n`
    baseMassage += `Message:\n${message_content}\n`
    if (attachments.length > 1) {
        baseMassage += `[Attachments]\n${attachments.join("\n")}\n`
    }else if(attachments.length > 0) {
        baseMassage += `[Attachment]${attachments.join("\n")}\n`
    }
    return baseMassage
}
