const httpStatus = require('http-status');
const express = require('express');
const router = express.Router();
const ApiError = require('../../../utils/ApiError');

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
          return res.status(error.statusCode).json(`Error Fetching Post: ${error.message}`);
        }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
    });

router.post('/createCommunity', async (req, res) => {
    try {
        const post = await userCommunityController.createCommunity(req, res);
        res.status(httpStatus.status.CREATED).json({
          isSuccess: true,
          message: "Community Created Successfully!",
          post,
        });
    
      } catch (error) {
        if (error instanceof ApiError) {
          return res.status(error.statusCode).json(`Error Creating Community: ${error.message}`);
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
          return res.status(error.statusCode).json(`Error Fetching Community: ${error.message}`);
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
          return res.status(error.statusCode).json(`Error Updating Community: ${error.message}`);
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
          return res.status(error.statusCode).json(`Error Deleting Community: ${error.message}`);
        }
    
        return res
          .status(httpStatus.status.INTERNAL_SERVER_ERROR)
          .json("Something went wrong!");
      }
});

module.exports = router;