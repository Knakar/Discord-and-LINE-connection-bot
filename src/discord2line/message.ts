import {
    OmitPartialGroupDMChannel,
    Message as DiscordMessage,
    TextChannel,
    ChatInputCommandInteraction, CommandInteraction, CacheType
} from "discord.js";
import {PushMessageRequest} from "@line/bot-sdk/dist/messaging-api/model/pushMessageRequest";
import {BroadcastRequest} from "@line/bot-sdk/dist/messaging-api/model/broadcastRequest";

export async function createDeliveryPushMessage(message: OmitPartialGroupDMChannel<DiscordMessage>): Promise<PushMessageRequest>{
    const referenceMessage = await message.channel.messages.fetch(message.reference?.messageId??"")
    // Extract the User id field of the embed
    const address = referenceMessage?.embeds.map(embed=>{
        return embed.toJSON().fields?.find(field=>field.name === "User ID")?.value
        })[0]
    const deliveryMessage = composeDeliveryMessageBase(message)
    return {
        to: address??"",
        messages: [{
            type: "text",
            text: deliveryMessage,
        }]
    }
}

export async function createDeliveryBroadcastMessage(message: OmitPartialGroupDMChannel<DiscordMessage>): Promise<BroadcastRequest>{
    let title: string;
    if (message.inGuild()) {
        title = `${message.channel.name} in ${message.guild.name}\n`
    }else {
        title = "Direct Message\n"
    }
    let replyTo: string|undefined;
    if(message.reference){
        const referenceMessage = await message.channel.messages.fetch(message.reference.messageId??"")
        replyTo = `\n[Reply to] @${referenceMessage.author.username}\n${referenceMessage.content.replace("\n", "\n> ")}`
    }

    let deliveryMessage = ""
    deliveryMessage += `[${title}]\n`
    deliveryMessage += composeDeliveryMessageBase(message)
    if(replyTo){
        deliveryMessage += replyTo
    }
    return {
        messages: [{
            type: "text",
            text: deliveryMessage,
        }]
    }
}

function composeDeliveryMessageBase(message: OmitPartialGroupDMChannel<DiscordMessage>): string {
    const auther = message.author.username
    const date = message.createdAt.toLocaleString("ja-JP")
    const message_content = message.content
    const attachments = message.attachments.map((attachment) =>{
        return attachment.url
    })
    let baseMassage = "";
    baseMassage += `Author: @${auther}\n`
    baseMassage += `Sent at: ${date}`
    if (message.content){
        baseMassage += `\n[Message[\n${message_content}`
    }
    if (attachments.length > 1) {
        baseMassage += `\n[Attachments]\n${attachments.join("\n")}`
    }else if(attachments.length > 0) {
        baseMassage += `\n[Attachment]\n${attachments.join("\n")}`
    }
    return baseMassage
}

export function composeCommandBroadcastMessage(interaction: ChatInputCommandInteraction<CacheType>): BroadcastRequest {
    const content = interaction.options.getString("message", true).replace(/\\n/g, "\n")
    const createdAt = new Date(interaction.createdTimestamp).toLocaleString("ja-JP")
    const channel = interaction.guild?.channels.cache.find((channel => channel.id === interaction.channelId))
    const categoryName = channel?.parent?.name.replace(/━/g, "")
    const guildName = interaction.guild?.name
    const username = interaction.user.username
    let message = ""
    if(channel ||  guildName){
        message += "["
        if(categoryName){
            message += categoryName + "::"
        }
        message += (channel?.name??"")
        if(guildName){
            message += " in " + guildName
        }

        message += "]\n"
    }
    message += "Created at: " + createdAt + " \n"
    message += "from: @" + username + " \n"
    message += "[Message]\n"+content
    return {
        messages: [{
            type: "text",
            text: message
        }]
    }
}