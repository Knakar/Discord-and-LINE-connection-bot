import {PushMessageRequest} from "@line/bot-sdk/dist/messaging-api/model/pushMessageRequest";
import {BroadcastRequest} from "@line/bot-sdk/dist/messaging-api/model/broadcastRequest";
import {messagingApi} from "@line/bot-sdk"
import * as dotenv from "dotenv";
dotenv.config()
export async function sendPushMessage(request: PushMessageRequest){
    const lineCli = new messagingApi.MessagingApiClient({
        channelAccessToken: process.env.LINE_API_TOKEN??""
    })
    await lineCli.pushMessageWithHttpInfo(request).then(response => {
        if(!response.httpResponse.ok){
            response.httpResponse.json().then((data: any) => {
                throw new Error(data)
            })
        }
    })
}
export async function sendBroadcastMessage(request: BroadcastRequest){
    const lineCli = new messagingApi.MessagingApiClient({
        channelAccessToken: process.env.LINE_API_TOKEN??""
    })
    await lineCli.broadcastWithHttpInfo(request).then(response => {
        if(!response.httpResponse.ok){
            response.httpResponse.json().then((data: any) => {
                throw new Error(data)
            })
        }
    })
}