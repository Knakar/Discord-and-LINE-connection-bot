import {NextFunction, Request, Response} from "express";
import {
    CacheType,
    ChatInputCommandInteraction,
    Client,
    Events,
    GatewayIntentBits, Interaction,
    Message,
    MessageFlags,
    OmitPartialGroupDMChannel,
    SlashCommandBuilder,
    Snowflake
} from "discord.js";

import {markError, markSuccess} from "./discord2line/discord";
import {
    composeCommandBroadcastMessage,
    createDeliveryBroadcastMessage,
    createDeliveryPushMessage
} from "./discord2line/message";
import {sendBroadcastMessage, sendPushMessage} from "./discord2line/line";

import * as dotenv from "dotenv";

dotenv.config();


export async function discord2line(request: Request, response: Response, next: NextFunction) {
    const discordCli = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
    })
    await discordCli.login(process.env.DISCORD_API_TOKEN);

    const sendPushMessageListener = createSendPushMessageListener("1315557387083710474") // #line通知
    const sendForwardChannelMessageListener = createForwardChannelMessageListener("1086956697513365585")
    const sendCommandMessageListener = createCommandMessageListener("1086213375240962158")
    // Set command
    discordCli.once(Events.ClientReady, async () => {
        const slashCommand = new SlashCommandBuilder()
            .setName("line")
            .setDescription("send broadcast message")
            .addStringOption(option =>
                option.setName("message")
                    .setDescription("message context")
                    .setRequired(true)
                    )
        await discordCli.application?.commands.create(slashCommand)
    })
    // Narrow cast Reply
    discordCli.on(Events.MessageCreate, sendPushMessageListener);
    // Forward Notification
    discordCli.on(Events.MessageCreate, sendForwardChannelMessageListener)
    // Discord command
    discordCli.on(Events.InteractionCreate, sendCommandMessageListener)
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
function createCommandMessageListener(roleId: Snowflake){
    return async (interaction: Interaction<CacheType>) => {
        if(!interaction.isCommand()){
            return;
        }
        if(interaction.commandName === "line"){
            const member = interaction.guild?.members.cache.find(user => user.id === interaction.user.id)
            if(member?.roles.cache.has(roleId)){
                if(interaction instanceof ChatInputCommandInteraction){
                    const deliveryMessage =　composeCommandBroadcastMessage(interaction)
                    try {
                        await sendBroadcastMessage(deliveryMessage)
                        await interaction.reply({content: "Sent for LINE subscribed listener!", flags: MessageFlags.Ephemeral})
                    }catch (error: unknown) {
                        if (error instanceof Error){
                            await interaction.reply({content: "ERROR: Not sent for following reason\n" + error.message, flags: MessageFlags.Ephemeral})
                        }
                    }
                }else{
                    await interaction.reply({content: "Wrong interaction", flags: MessageFlags.Ephemeral})
                }

            }else{
                await interaction.reply({content: "Permission denied. Please check your roles", flags: MessageFlags.Ephemeral})
            }
        }
    }
}