import {OmitPartialGroupDMChannel, Message as DiscordMessage, Snowflake} from "discord.js";
import {PushMessageRequest} from "@line/bot-sdk/dist/messaging-api/model/pushMessageRequest";

export function createDeliveryPushMessage(message: OmitPartialGroupDMChannel<DiscordMessage>): PushMessageRequest{}
export function createDeliveryBroadcastMessage(message: OmitPartialGroupDMChannel<DiscordMessage>,channelId: string): PushMessageRequest{}
