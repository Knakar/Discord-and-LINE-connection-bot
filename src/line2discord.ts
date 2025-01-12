import {NextFunction, Request, Response} from "express";
import {receiveLineMessage} from "./line2discord/line"
import {createResponseMessage} from "./line2discord/message";
import {send_discord_messages} from "./line2discord/discord";
export const line2discord = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const receive_message = await receiveLineMessage(request);
    const response_message = await createResponseMessage(receive_message);
    await send_discord_messages(response_message);
    response.status(200)
}