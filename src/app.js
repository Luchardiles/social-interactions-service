const { Server } = require("@grpc/grpc-js");
const { grpcErrorHandler } = require("./middlewares/grpcErrorHandlerMiddleware");
const loadProto = require("./utils/loadProto");
const socialInteractionService = require("./services/socialInteractionService");

const server = new Server();
const proto = loadProto("socialInteractions");
server.addService(proto.SocialInteractions.service, socialInteractionService);

// Inicializa manejo global de errores y consumidores de RabbitMQ
grpcErrorHandler(server);

module.exports = server;