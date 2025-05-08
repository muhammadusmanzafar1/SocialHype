const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const { validate } = require('../../../middlewares/auth');
const { getFollowing, getFollowers, followUser, acceptFollowRequest, unfollowUser } = require('../controllers/followersController');
const { followValidator, acceptFollowValidator, unfollowValidator } = require('../validators/followers');

router.get('/following/:userId', async (req, res) => {
  try {
    const result = await getFollowing(req.params.userId, req.query);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Server Error' });
  }
});

router.get('/followers/:userId', async (req, res) => {
  try {
    const result = await getFollowers(req.params.userId, req.query);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Server Error' });
  }
});

router.post('/follow', validate, async (req, res) => {
  const { error } = followValidator.body.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Validation Error',
      errors: error.details.map(err => err.message),
    });
  }
  try {
    const result = await followUser(req.user._id, req.body.userId);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error Communism Server Error' });
  }
});

router.patch('/accept', validate, async (req, res) => {
  const { error } = acceptFollowValidator.body.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Validation Error',
      errors: error.details.map(err => err.message),
    });
  }
  try {
    const result = await acceptFollowRequest(req.user._id, req.body.requesterId);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Server Error' });
  }
});

router.delete('/unfollow', validate, async (req, res) => {
  const { error } = unfollowValidator.body.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Validation Error',
      errors: error.details.map(err => err.message),
    });
  }
  try {
    const result = await unfollowUser(req.user._id, req.body.userId);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;