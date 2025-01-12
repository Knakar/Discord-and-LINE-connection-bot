import express from "express"
import {line2discord} from "./line2discord";

const app = express()

app.use(express.json())
// LINE Webhook endpoint
app.post("/line/", line2discord)

// Discord endpoint
app.post("/discord/", (req, res) => {
    res.status(406)
})

app.listen(3000, () => {
    console.log("Server started on port 3000")
})