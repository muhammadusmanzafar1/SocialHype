const express = require("express");
const router = express.Router();
const httpStatus = require("http-status");
const postController = require("../controllers/userPostController.js");
const ApiError = require("../../../utils/ApiError.js");
const validate = require("../validators/userPost.js")
const upload = require("../../../middlewares/upload.js");


router.post('/createPost', upload.fields([ { name: 'media', maxCount: 1 } ]), async (req, res) => {
  const { error, value } = validate.postValidationSchema.validate(req.body);

if (error) {
  return res.status(400).json({ error: error.details[0].message });
}
  try {
    const post = await postController.createPost(req, res);
    res.status(httpStatus.status.CREATED).json({
      isSuccess: true,
      message: "Post Created Successfully!",
      post,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Creating Post: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.get('/getAllPosts/:userId', async (req, res) => {
  try {
    const posts = await postController.getAllPosts(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Posts Fetched Successfully!",
      posts,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Fetching Posts: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.get('/getPostDetail/:postId', async (req, res) => {
  try {
    const post = await postController.getPostDetail(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Post Fetched Successfully!",
      post,
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Fetching Post: ${error.message}`);
    }

    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
})

router.patch('/updatePost/:postId', async (req, res) => {
  try {
    const post = await postController.updatePost(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Post Updated Successfully!",
      post,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Updating Post: ${error.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.delete('/deletePost/:postId', async (req, res) => {
  try {
    const post = await postController.deletePost(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Post Deleted Successfully!",
      post,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Deleting Post: ${error.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.patch('/votePost/:postId', async (req, res) => {
  try {
    const post = await postController.votePost(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Post Voted Successfully!",
      post,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Voting Post: ${error.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.post('/savePost/:postId', async (req, res) => {
  try {
    const post = await postController.savePost(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Post Saved Successfully!",
      post,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Saving Post: ${error.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.patch('/sharePost/:postId', async (req, res) => {
  try {
    const post = await postController.sharePost(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Post Shared Successfully!",
      post,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Sharing Post: ${error.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.get('/getAllPostsComments/:postId', async (req, res) => {
  try {
    const post = await postController.getAllPostsComments(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Post Comments Fetched Successfully!",
      post,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(`Error Fetching Post Comments: ${error.message}`);
    }
    return res
      .status(httpStatus.status.INTERNAL_SERVER_ERROR)
      .json("Something went wrong!");
  }
});

router.get("/savedPosts/:userId", async (req, res) => {
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

module.exports = router;
  