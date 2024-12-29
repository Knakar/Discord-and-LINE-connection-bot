import crypto from "node:crypto";
import dotenv from "dotenv"
dotenv.config({path: "../.env"})

export async function receiveLineMessage(request: Request<unknown, CfProperties<unknown>>){

}

function check_signature(body: string, header_signature: string): boolean{
    const secret_key = process.env.LINE_WEBHOOK_SECRETKEY
    if (secret_key!==undefined){
        const body_signature = crypto.createHmac("SHA256", secret_key)
            .update(body)
            .digest("base64")
        return header_signature===body_signature
    }
    return false;
}
