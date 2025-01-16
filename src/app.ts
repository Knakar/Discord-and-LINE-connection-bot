import express from "express"
import {line2discord} from "./line2discord";
import {discord2line} from "./discord2line";

const app = express()
const port = process.env.PORT || 3000;

app.use(express.json())
// LINE Webhook endpoint
app.post("/line/", line2discord)

// Discord endpoint
app.head("/discord/", discord2line)

app.listen(port, () => {
    console.log(`Server started on port :${port}`)
})