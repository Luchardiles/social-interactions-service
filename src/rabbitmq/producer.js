const {connectRabbit} = require("./connection");
const {videoUpdatedQueueSocialInteractions} = require("../config/env");


async function publishVideoUpdatedEvent(videoId, updatedData) {
    const ch = await connectRabbit();
    await ch.assertQueue(videoUpdatedQueueSocialInteractions, { durable: true });
    const payload = JSON.stringify({ id: videoId, ...updatedData });
    ch.sendToQueue(videoUpdatedQueueSocialInteractions, Buffer.from(payload), { persistent: true });
}

module.exports = {
    publishVideoUpdatedEvent
};
