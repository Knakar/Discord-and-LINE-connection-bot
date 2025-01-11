import express from "express"

const app = express()

// LINE Webhook endpoint
app.post("/line/")

// Discord endpoint
app.post("/discord/")