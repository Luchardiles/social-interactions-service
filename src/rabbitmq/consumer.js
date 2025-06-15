const {connectRabbit} = require("./connection");
const Video = require("../models/videoModel");
const {videoCreatedQueue, videoDeletedQueue} = require("../config/env");

async function consumeVideoEvents() {
    const ch = await connectRabbit();
    await ch.assertQueue(videoCreatedQueue, { durable: true });
    await ch.assertQueue(videoDeletedQueue, { durable: true });
    ch.consume(videoCreatedQueue, async (msg) => {
        const video = JSON.parse(msg.content.toString());
        await Video.create({ data: video });
        ch.ack(msg);
    });
    ch.consume(videoDeletedQueue, async (msg) => {
        const videoId = msg.content.toString();
        await Video.deleteOne({ where: { id: videoId } });
        ch.ack(msg);
    });

}
module.exports = {
    consumeVideoEvents
};
