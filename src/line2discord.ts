import {NextFunction, Request, Response} from "express";
import {receiveLineMessage} from "./line2discord/line"
import {createResponseMessage} from "./line2discord/message";
import {send_discord_messages} from "./line2discord/discord";
export const line2discord = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const receiveMessage = await receiveLineMessage(request);
    const responseMessage = await createResponseMessage(receiveMessage);
    await send_discord_messages(responseMessage);
    response.status(200)
}