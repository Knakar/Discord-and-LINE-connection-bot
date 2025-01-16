import express from "express"
import {line2discord} from "./line2discord";
import {discord2line} from "./discord2line";

const app = express()

app.use(express.json())
// LINE Webhook endpoint
app.post("/line/", line2discord)

// Discord endpoint
app.head("/discord/", discord2line)

app.listen(80, () => {
    console.log("Server started on port 80")
})