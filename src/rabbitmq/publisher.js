const {connectRabbit} = require("./connection");
const {videoUpdatedQueue} = require("../config/env");


async function publishVideoUpdatedEvent(videoId, updatedData) {
    const ch = await connectRabbit();
    await ch.assertQueue(videoUpdatedQueue, { durable: true });
    const payload = JSON.stringify({ id: videoId, ...updatedData });
    ch.sendToQueue(videoUpdatedQueue, Buffer.from(payload), { persistent: true });
}

module.exports = {
    publishVideoUpdatedEvent
};
