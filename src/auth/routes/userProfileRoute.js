const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const profileController = require("../controllers/userProfileController.js");
const ApiError = require("../../../utils/ApiError.js");

router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await profileController.getProfile(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "User Details Fetched Successfully!",
      user,
    });
  } catch (e) {
    if (error instanceof ApiError) {
      return res.status(e.statusCode).json(`Error Fetching Data: ${e.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.put("/profile/edit", async (req, res) => {
  try {
    const updatedUser = await profileController.editProfile(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "User Profile Edit Successful! ",
      updatedUser,
    });
  } catch (e) {
    if (error instanceof ApiError) {
      return res.status(e.statusCode).json(`Error Fetching Data: ${e.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.patch("/api/profile/creator/register", async (req, res) => {
  try {
    const updatedUser = await profileController.registerCreator(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "User Profile Created Successfully! ",
      updatedUser,
    });
  } catch (e) {
    if (error instanceof ApiError) {
      return res.status(e.statusCode).json(`Error Fetching Data: ${e.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.patch("/creator/unregister", async (req, res) => {
  try {
    const updatedUser = await profileController.unregisterAsCreator(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Creater removed Successfully! ",
      updatedUser,
    });
  } catch (e) {
    if (error instanceof ApiError) {
      return res.status(e.statusCode).json(`Error Fetching Data: ${e.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.patch("/creator/change-price", async (req, res) => {
  try {
    const updatedUser = await profileController.changeExclusivePrice(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Exclusive Price changed Successfully! ",
      updatedUser,
    });
  } catch (e) {
    if (error instanceof ApiError) {
      return res.status(e.statusCode).json(`Error Fetching Data: ${e.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

module.exports = router;
