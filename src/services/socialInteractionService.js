const {catchGrpc} = require('../utils/catchGrpc'); 
const AppError = require('../utils/appError');
const Video = require('../models/videoModel');
const Comment = require('../models/commentModel');
const { publishVideoUpdatedEvent } = require('../rabbitmq/publisher');

const GiveLike = catchGrpc(async (call, callback) => {
    const { videoId } = call.request;
    const video = await Video.findById(videoId);
    if (!video) {
        return callback(new AppError("Video not found", 404), null);
    }
    video.likes += 1;
    await video.save();
    await publishVideoUpdatedEvent(videoId, { likes: video.likes });
    callback(null, { video });
});

const GiveComment = catchGrpc(async (call, callback) => {
    const { videoId, comment } = call.request;
    const video = await Video.findById(videoId);
    if (!video) {
        return callback(new AppError("Video not found", 404), null);
    }
    const newComment = await Comment.create({ video: videoId, comment: comment });
    video.comments.push(newComment);
    await video.save();
    callback(null, { video });
});

const ListCommentsLikes = catchGrpc(async (call, callback) => {
    const { videoId } = call.request;
    const video = await Video.findById(videoId).populate("comments");
    if (!video) {
        return callback(new AppError("Video not found", 404), null);
    }
    callback(null, { comments: video.comments, likes: video.likes });
});

module.exports = {
    GiveLike,
    GiveComment,
    ListCommentsLikes
};
