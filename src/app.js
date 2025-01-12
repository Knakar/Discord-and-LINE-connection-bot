"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
//import {line2discord} from "./line2discord";
var app = (0, express_1.default)();
/*
app.use(express.json())
// LINE Webhook endpoint
app.post("/line/", line2discord)
*/
// Discord endpoint
app.post("/discord/", function (req, res) {
    res.status(406);
});
