const httpStatus = require('http-status');
const express = require('express');
const router = express.Router();
const ApiError = require('../../../utils/ApiError');
const upload = require('../../../middlewares/upload');

const userCommunityController = require('../controllers/userCommunityController');

router.get('/getUserCommunities', async (req, res) => {
    try {
        const post = await userCommunityController.getAllCommunities(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "User Communities Fetched Successfully!",
          post,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
    });

router.post('/createCommunity', upload.fields([ { name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }, ]), async (req, res) => {
    try {
        const post = await userCommunityController.createCommunity(req, res);
        res.status(httpStatus.status.CREATED).json({
          isSuccess: true,
          message: "Community Created Successfully!",
          post,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

router.get('/getCommunityById/:communityId', async (req, res) => {
    try {
        const post = await userCommunityController.getCommunityById(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Community Fetched Successfully!",
          post,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

router.put('/updateCommunity/:communityId', async (req, res) => {
    try {
        const post = await userCommunityController.updateCommunity(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Community Updated Successfully!",
          post,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

router.delete('/deleteCommunity/:communityId', async (req, res) => {
    try {
        const post = await userCommunityController.deleteCommunity(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Community Deleted Successfully!",
          post,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

router.put('/joinCommunity/:communityId', async (req, res) => {
    try {
        const post = await userCommunityController.joinCommunity(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Joined Community Successfully!",
          post,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

router.get('/getCommunityMembers/:communityId', async (req, res) => {
    try {
        const members = await userCommunityController.getCommunityMembers(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Community Members Fetched Successfully!",
          members,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

router.delete('/leaveCommunity/:communityId', async (req, res) => {
    try {
        const member = await userCommunityController.leaveCommunity(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Left Community Successfully!",
          member,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");          
      }
});

router.get('/searchCommunities', async (req, res) => {
    try {
        const communities = await userCommunityController.searchCommunities(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Communities Search Results Fetched Successfully!",
          communities,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

router.get('/getCommunityModerators/:communityId', async (req, res) => {
    try {
        const moderators = await userCommunityController.getCommunityModerators(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Community Moderators Fetched Successfully!",
          moderators,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

router.post('/addModerator/:communityId', async (req, res) => {
    try {
        const moderator = await userCommunityController.addModerator(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Moderator Added Successfully!",
          moderator,
        });

      } catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
              isSuccess: false,
              error: {
                message: error.message,
                statusCode: error.statusCode,
              },
            });
          }

        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

module.exports = router;