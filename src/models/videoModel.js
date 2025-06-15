const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const VideoSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Video", VideoSchema);