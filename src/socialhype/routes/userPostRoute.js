const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const postController = require("../controllers/userPostController.js");
const ApiError = require("../../../utils/ApiError.js");


router.get("/api/posts/saved/:userId", async (req, res) => {
  try {
    const user = await postController.getSavedPosts(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "User Saved Posts Fetched Successfully!",
      user,
    });
  } catch (e) {
    if (error instanceof ApiError) {
      return res.status(e.statusCode).json(`Error Fetching Posts: ${e.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});


router.get(" /api/posts/tagged/:userId", async (req, res) => {
    try {
      const user = await postController.getTaggedPosts(req, res);
      res.status(httpStatus.status.OK).json({
        isSuccess: true,
        message: "User Saved Posts Fetched Successfully!",
        user,
      });
    } catch (e) {
      if (error instanceof ApiError) {
        return res.status(e.statusCode).json(`Error Fetching Posts: ${e.message}`);
      }
  
      return res
        .status(httpStatus.status.INTERNAL_SERVER_ERROR)
        .json("Something went wrong!");
    }
  });
  