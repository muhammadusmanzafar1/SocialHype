const httpStatus = require("http-status")
const ApiError = require("../../../utils/ApiError");
const Challenges = require("../models/challenge");

exports.getAllChallenges = async (req, res) => {
try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
    const skip = (page - 1) * limit;

    const challenges = await Challenges.find({ status: "active" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalChallenges = await Challenges.countDocuments({ status: "active" });
    const totalPages = Math.ceil(totalChallenges / limit);

    if (!challenges || challenges.length === 0) {
        throw new ApiError(
            "No active challenges found",
            httpStatus.status.NOT_FOUND
        );
    }

    return {
        challenges,
        currentPage: parseInt(page),
        totalPages,
        totalChallenges,
    };
} catch (error) {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError(
        "Something went wrong while fetching challenges",
        httpStatus.status.INTERNAL_SERVER_ERROR
    );
}
}

exports.createChallenge = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    if (!title || !description || !startDate || !endDate) {
      throw new ApiError("All fields are required", httpStatus.status.BAD_REQUEST);
    }

    const newChallenge = new Challenges({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.user._id, 
    });

    const savedChallenge = await newChallenge.save();
    return savedChallenge;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Something went wrong while creating the challenge",
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
}

exports.getChallengeById = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const challenge = await Challenges.findById(challengeId);
    if (!challenge) {
      throw new ApiError("Challenge not found", httpStatus.status.NOT_FOUND);
    }
    return challenge;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Something went wrong while fetching the challenge",
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
}