const User = require("../models/user");

// Get full profile info for a user by their ID
exports.getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "Invalid user ID" });
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

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//Register a user as a creator with payout details and content price
exports.registerCreator = async (req, res) => {
  const { userId, exclusivePrice } = req.body;

  if (exclusivePrice == null || exclusivePrice < 0) {
    return res
      .status(400)
      .json({ message: "Valid exclusivePrice is required" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isCreator: true, exclusivePrice },
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Remove creator role from a user
exports.unregisterAsCreator = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.isCreator) {
      return res.status(400).json({ message: "User is not a creator" });
    }

    user.isCreator = false;
    user.exclusivePrice = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Creator role removed successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.changeExclusivePrice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exclusivePrice } = req.body;

    if (exclusivePrice === undefined || typeof exclusivePrice !== "number") {
      return res
        .status(400)
        .json({ message: "exclusivePrice must be a valid number" });
    }

    const user = await User.findById(userId);
    if (!user || !user.isCreator) {
      return res
        .status(400)
        .json({ message: "Only creators can change the exclusive price" });
    }

    user.exclusivePrice = exclusivePrice;
    await user.save();

    res.status(200).json({ message: "Exclusive price updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
