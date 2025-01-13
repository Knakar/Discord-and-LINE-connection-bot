import {Message, OmitPartialGroupDMChannel} from "discord.js";

export async function markSuccess(message: OmitPartialGroupDMChannel<Message>) {
    return await reactEmoji(message, "line_success")
}
export async function markError(message: OmitPartialGroupDMChannel<Message>) {
    return await reactEmoji(message, "line_failure")
}
async function reactEmoji(message: OmitPartialGroupDMChannel<Message>, emoji_name: string) {
    const emoji = message.guild?.emojis.cache.find(emoji => emoji.name === emoji_name)
    if (emoji){
        await message.react(emoji)
    }
}
