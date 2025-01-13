import {PushMessageRequest} from "@line/bot-sdk/dist/messaging-api/model/pushMessageRequest";
import {BroadcastRequest} from "@line/bot-sdk/dist/messaging-api/model/broadcastRequest";
import {messagingApi} from "@line/bot-sdk"
import * as dotenv from "dotenv";
dotenv.config()
export function sendPushMessage(request: PushMessageRequest){
    const lineCli = new messagingApi.MessagingApiClient({
        channelAccessToken: process.env.LINE_API_TOKEN??""
    })
    lineCli.pushMessageWithHttpInfo(request).then(response => {
        if(!response.httpResponse.ok){
            response.httpResponse.json().then((data: any) => {
                throw new Error(data)
            })
        }
    })
}
export function sendBroadcastMessage(request: BroadcastRequest){
    const lineCli = new messagingApi.MessagingApiClient({
        channelAccessToken: process.env.LINE_API_TOKEN??""
    })
    lineCli.broadcastWithHttpInfo(request).then(response => {
        if(!response.httpResponse.ok){
            response.httpResponse.json().then((data: any) => {
                throw new Error(data)
            })
        }
    })
}