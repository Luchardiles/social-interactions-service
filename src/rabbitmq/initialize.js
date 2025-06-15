const {consumeVideoEvents} = require("./consumer");

async function initializeConsumers() {
    try {
        await consumeVideoEvents();
        console.log("RabbitMQ consumers initialized successfully.");
    } catch (error) {
        console.error("Error initializing RabbitMQ consumers:", error);
    }
}

module.exports = initializeConsumers;
