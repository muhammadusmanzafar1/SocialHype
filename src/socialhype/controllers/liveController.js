const httpStatus = require('http-status');
const ApiError = require('../../../utils/ApiError');
const LiveSession = require('../models/liveSession');

exports.startLiveSession = async (req) => {
    const { hostUserId } = req.body;

    try {if (!hostUserId) {
        throw new ApiError('Host user ID is required', httpStatus.status.BAD_REQUEST);
    }

    const liveSession = new LiveSession({
        hostUserId
    });

    await liveSession.save();

    return liveSession;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || 'Failed to start live session', error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.endLiveSession = async (req) => {
    const { sessionId } = req.body;

    try {
        if (!sessionId) {
            throw new ApiError('Session ID is required', httpStatus.status.BAD_REQUEST);
        }

        const liveSession = await LiveSession.findById(sessionId);

        if (!liveSession) {
            throw new ApiError('Live session not found', httpStatus.status.NOT_FOUND);
        }

        liveSession.isLive = false;
        liveSession.endedAt = new Date();
        await liveSession.save();

        return liveSession;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || 'Failed to end live session', error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}

exports.getLiveSessions = async (req) => {
    const { sessionId } = req.params;

    try {
        if (!sessionId) {
            throw new ApiError('Session ID is required', httpStatus.status.BAD_REQUEST);
        }

        const liveSessions = await LiveSession.find({ _id: sessionId });

        if (!liveSessions || liveSessions.length === 0) {
            throw new ApiError('No live sessions found', httpStatus.status.NOT_FOUND);
        }

        return liveSessions;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error.message || 'Failed to fetch live sessions', error.statusCode || httpStatus.status.INTERNAL_SERVER_ERROR);
    }
}