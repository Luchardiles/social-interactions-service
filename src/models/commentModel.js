const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CommentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    videoId: {
      type: String,
      required: [true, "The video ID is required"],
      ref: "Video",
    },
    comment: {
      type: String,
      required: [true, "The comment is required"],
      trim: true,
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

module.exports = mongoose.model("Comment", CommentSchema);