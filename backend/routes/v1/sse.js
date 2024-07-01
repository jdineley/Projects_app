const express = require("express");
const SSEChannel = require('sse-pubsub');

const channel = new SSEChannel();

const router = express.Router();


router.get('/stream', (req, res) => channel.subscribe(req, res))



module.exports = {router, channel};
