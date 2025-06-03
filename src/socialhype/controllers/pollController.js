const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const pollModel = require('../models/poll');

exports.createPoll = async (req, res) => {
    const userId = req.user._id;
    const { question, options, isExclusive, expiryAt } = req.body;
    try {
        if (!question || !options || options.length < 2) {
            throw new ApiError("Question and at least two options are required", httpStatus.status.BAD_REQUEST);
        }

        const poll = await pollModel.create({
            userId,
            question,
            options: options.map(option => ({
                optionText: option.optionText,
                votes: option.votes || 0
            })),
            isExclusive: isExclusive || false
        });

        return poll;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getPolls = async (req, res) => {
    const userId = req.user._id;
    try {
        const polls = await pollModel.find({ userId })
            .populate('userId', 'fullName username profilePicture')
            .populate({
                path: 'options.userId',
                select: 'fullName username profilePicture'
            });
        
        return polls;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.votePoll = async (req, res) => {
    const { pollId, optionIndex, userId } = req.body;
    try {
        if (!pollId || optionIndex === undefined || !userId) {
            throw new ApiError("Poll ID, option index, and user ID are required", httpStatus.status.BAD_REQUEST);
        }
        const poll = await pollModel.findById(pollId);

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            throw new ApiError("Invalid option index", httpStatus.status.BAD_REQUEST);
        }

        if (poll.isExclusive) {
            const alreadyVoted = poll.options.some(option => 
                option.userId && option.userId.equals(userId)
            );
            if (alreadyVoted) {
                throw new ApiError("You can only vote once in this poll", httpStatus.status.BAD_REQUEST);
            }
        }

        poll.options[optionIndex].votes += 1;
        poll.options[optionIndex].userId = userId;

        await poll.save();
        return poll;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.deletePoll = async (req) => {
    const { pollId } = req.params;
    const userId = req.user._id;
    
    try {
        const poll = await pollModel.findOne({ _id: pollId });
        
        if (!poll) {
            throw new ApiError("Poll not found", httpStatus.status.NOT_FOUND);
        }

        if (!poll.userId.equals(userId)) {
            throw new ApiError("Unauthorized - You can only delete your own polls", httpStatus.status.FORBIDDEN);
        }
        const deletedPoll = await pollModel.findByIdAndDelete(pollId);
        
        return deletedPoll;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || "Server Error", error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}