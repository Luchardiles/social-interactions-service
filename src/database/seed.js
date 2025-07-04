const { connectMongo, closeMongo } = require("./mongooseConfig");
const Video = require("../models/videoModel");
const Comment = require("../models/commentModel");
const fs = require("fs");
const path = require("path");

async function seed() {
  try {
    console.log("🔄 Starting database seeding...");

    const videosPath = path.resolve(__dirname, "../../mock/videos.json");
    const videosData = JSON.parse(fs.readFileSync(videosPath, "utf-8"));

    const commentsPath = path.resolve(__dirname, "../../mock/comments.json");
    const commentsData = JSON.parse(fs.readFileSync(commentsPath, "utf-8"));

    await connectMongo();
    await Video.deleteMany({});
    await Comment.deleteMany({});

    console.log(`🛠 Seeding ${videosData.length} videos...`);

    const videos = videosData.map((video) => ({
      _id: video.id,
      likes: video.likes,
    }));
    await Video.insertMany(videos);

    console.log(`🛠 Seeding ${commentsData.length} comments...`);

    const comments = commentsData.map((comment) => ({
      videoId: comment.videoId,
      comment: comment.comment,
    }));
    await Comment.insertMany(comments);

    console.log("✅ Database seeding completed successfully.");
  } catch (err) {
    console.error("❌ Error during seeding:", error);
  } finally {
    await closeMongo();
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
