const mongoose = require("mongoose");
const env = require("../config/env");

const {
  nodeEnv,
  database: { host, port, username, password, db },
  mongodbUri,
} = env;

let URI;
if (nodeEnv !== "production") {
  // build a local/dev URI with auth if provided
  const authPart =
    username && password
      ? `${encodeURIComponent(username)}:${encodeURIComponent(
          password
        )}@`
      : "";
  URI = `mongodb://${authPart}${host}:${port}/${db}?authSource=admin`;
} else {
  // use the one you loaded into env.js
  URI = mongodbUri;
}

/**
 * Conecta a MongoDB usando Mongoose y devuelve la conexión.
 */
async function connectMongo() {
  try {
    await mongoose.connect(URI);
    console.log("Connected to Mongo at", URI);
    return mongoose.connection;
  } catch (err) {
    console.error("Error connecting to Mongo:", err);
    throw err;
  }
}

/**
 * Cierra la conexión de Mongoose.
 */
async function closeMongo() {
  try {
    await mongoose.connection.close();
    console.log("Closed MongoDB connection");
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
  }
}

module.exports = {
  connectMongo,
  closeMongo,
};