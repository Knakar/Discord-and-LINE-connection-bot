import {OmitPartialGroupDMChannel, Message as DiscordMessage, TextChannel} from "discord.js";
import {PushMessageRequest} from "@line/bot-sdk/dist/messaging-api/model/pushMessageRequest";

export async function createDeliveryPushMessage(message: OmitPartialGroupDMChannel<DiscordMessage>): Promise<PushMessageRequest>{
    const referenceMessage = await message.channel.messages.fetch(message.reference?.messageId??"")
    // Extract the User id field of the embed
    const address = referenceMessage?.embeds.map(embed=>{
        return embed.toJSON().fields?.find(field=>field.name === "User Id")?.value
        })[0]
    const baseDeliveryMessage = composeDeliveryMessageBase(message)
    return {
        to: address??"",
        messages: [{
            type: "text",
            text: baseDeliveryMessage,
        }]
    }
}
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
    baseMassage += `Sent at: ${date}\n`
    baseMassage += `Message:\n${message_content}\n`
    if (attachments.length > 1) {
        baseMassage += `[Attachments]\n${attachments.join("\n")}\n`
    }else if(attachments.length > 0) {
        baseMassage += `[Attachment]${attachments.join("\n")}\n`
    }
    return baseMassage
}
