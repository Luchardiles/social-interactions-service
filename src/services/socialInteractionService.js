const {catchGrpc} = require('../utils/catchGrpc'); 
const AppError = require('../utils/appError');
const Video = require('../models/videoModel');
const Comment = require('../models/commentModel');
const { publishVideoUpdatedEvent } = require('../rabbitmq/publisher');

const GiveLike = catchGrpc(async (call, callback) => {
    const { videoId } = call.request;
    if (!videoId) {
        return callback(new AppError("Video ID is required", 400), null);
    }
    const video = await Video.findById(videoId);
    if (!video) {
        return callback(new AppError("Video not found", 404), null);
    }
    video.likes += 1;
    await video.save();
    await publishVideoUpdatedEvent(videoId, { likes: video.likes });
    callback(null, { status: 204 });
});

const GiveComment = catchGrpc(async (call, callback) => {
    const { videoId, comment } = call.request;
    if (!videoId || !comment) {
        return callback(new AppError("Video ID and comment are required", 400), null);
    }
    const video = await Video.findById(videoId);
    if (!video) {
        return callback(new AppError("Video not found", 404), null);
    }
    const newComment = await Comment.create({ video: videoId, comment: comment });
    video.comments.push(newComment);
    await video.save();
    callback(null, { status: 204 });
});

const ListCommentsLikes = catchGrpc(async (call, callback) => {
    const { videoId } = call.request;
    if (!videoId) {
        return callback(new AppError("Video ID is required", 400), null);
    }
    const video = await Video.findById(videoId).populate("comments");
    if (!video) {
        return callback(new AppError("Video not found", 404), null);
    }
    callback(null, { status: 200, likes: video.likes, comments: video.comments });
});

module.exports = {
    GiveLike,
    GiveComment,
    ListCommentsLikes
};
