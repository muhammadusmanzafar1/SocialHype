const ApiError = require("../../../utils/ApiError.js");
const httpStatus = require("http-status");
const User = require("../../../src/auth/models/user.js");

// Get full profile info for a user by their ID
exports.getProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError("User Not Found!", httpStatus.status.NOT_FOUND);
    return user;
  } catch (err) {
    throw new ApiError(
      `Error While Fetching Data: ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Edit profile details like name, username, gender, and images
exports.editProfile = async (req, res) => {
  const { userId, fullName, username, gender, profileImage, profileBanner } =
    req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        username,
        gender,
        profileImage,
        profileBanner,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) throw new ApiError("User Not Found!", 404);
    return updatedUser;
  } catch (err) {
    throw new ApiError(
      `Error While Editing Profile Data : ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

//Register a user as a creator with payout details and content price
exports.registerCreator = async (req, res) => {
  const { userId, exclusivePrice } = req.body;

  if (exclusivePrice == null || exclusivePrice < 0) {
    throw new ApiError("Valid ExclusivePrice is Required", 400);
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isCreator: true, exclusivePrice },
      { new: true, runValidators: true }
    );
    if (!updatedUser) throw new ApiError("User Not Found!", 404);
    return updatedUser;
  } catch (err) {
    throw new ApiError(
      `Error While Editing Profile Data : ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Remove creator role from a user
exports.unregisterAsCreator = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.isCreator)
      throw new ApiError("User is Not a Creater", 400);
    user.isCreator = false;
    user.exclusivePrice = undefined;
    await user.save();
    return user;
  } catch (error) {
    throw new ApiError(
      `Error While Editing Profile Data : ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};

// Change the exclusive content price for a creator
exports.changeExclusivePrice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exclusivePrice } = req.body;

    if (exclusivePrice === undefined || typeof exclusivePrice !== "number") {
      throw new ApiError("ExclusivePrice must be a valid number", 400);
    }

    const user = await User.findById(userId);
    if (!user || !user.isCreator) {
      throw new ApiError("Only creators can change the exclusive price", 400);
    }

    user.exclusivePrice = exclusivePrice;
    await user.save();
    return user;
  } catch (error) {
    throw new ApiError(
      `Error While Editing Profile Data : ${err.message}`,
      httpStatus.status.INTERNAL_SERVER_ERROR
    );
  }
};
