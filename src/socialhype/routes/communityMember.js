const httpStatus = require('http-status');
const express = require('express');
const router = express.Router();
const ApiError = require('../../../utils/ApiError');

const communityMembers = require('../controllers/communityMemberController');

router.get('/getCommunityModerators/:communityId', async (req, res) => {
    try {
        const moderators = await communityMembers.getCommunityModerators(req, res);
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
        const moderator = await communityMembers.addModerator(req, res);
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

router.get('/getCommunityRequests/:communityId', async (req, res) => {
    try {
        const requests = await communityMembers.getCommunityRequests(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Community Requests Fetched Successfully!",
          requests,
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

router.put('/acceptCommunityRequest/:communityId/:userId', async (req, res) => {
    try {
        const request = await communityMembers.acceptCommunityRequest(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Community Request Accepted Successfully!",
          request,
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

router.delete('/rejectCommunityRequest/:communityId/:userId', async (req, res) => {
    try {
        const request = await communityMembers.rejectCommunityRequest(req, res);
        res.status(httpStatus.status.OK).json({
          isSuccess: true,
          message: "Community Request Rejected Successfully!",
          request,
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

router.put('/changeCommunityAdmin/:communityId/:userId', async (req, res) => {
  try {
    const changedAdmin = await communityMembers.changeCommunityAdmin(req, res);
    res.status(httpStatus.status.OK).json({
      isSuccess: true,
      message: "Admin Changed Successfully!",
      changedAdmin,
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
})

router.get('/getCommunityMembers/:communityId', async (req, res) => {
    try {
        const members = await communityMembers.getCommunityMembers(req, res);
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

module.exports = router;