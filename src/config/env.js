require("dotenv").config();

module.exports = {
  port: process.env.PORT || 50057,
  serverUrl: process.env.SERVER_URL || "localhost",
  nodeEnv: process.env.NODE_ENV || "development",
  rabbitmqUrl: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
  videoCreatedQueue: process.env.VIDEO_CREATED_QUEUE || "video.created",
  videoUpdatedQueueSocialInteractions:
    process.env.VIDEO_UPDATED_QUEUE_SOCIAL_INTERACTIONS ||
    "video.updated.social.interactions",
  videoDeletedQueueSocialInteractions:
    process.env.VIDEO_DELETED_QUEUE_SOCIAL_INTERACTIONS ||
    "video.deleted.social.interactions",
  database: {
    host: process.env.DATABASE_HOST || "localhost",
    port: process.env.DATABASE_PORT || 27020,
    username: process.env.DATABASE_USERNAME || "root",
    password: process.env.DATABASE_PASSWORD || "rootpassword",
    db: process.env.DATABASE_DB || "socialInteractions",
  },
  // new—so mongooseConfig can just grab this
  mongodbUri:
    process.env.MONGODB_URI ||
    // fallback if you hadn’t set MONGODB_URI:
    `mongodb://${encodeURIComponent(
      process.env.DATABASE_USERNAME || "root"
    )}:${encodeURIComponent(process.env.DATABASE_PASSWORD || "rootpassword")}@${
      process.env.DATABASE_HOST || "localhost"
    }:${process.env.DATABASE_PORT || 27020}/${
      process.env.DATABASE_DB || "socialInteractions"
    }?authSource=admin`,
};
