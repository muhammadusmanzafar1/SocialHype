const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const { validate } = require('../../middlewares/auth');
const { createCommunity, joinCommunity } = require('../controllers/communitiesController');
const { createCommunityValidator, joinCommunityValidator } = require('../validators/communities');

router.post('/create', validate, async (req, res) => {
  const { error } = createCommunityValidator.body.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Validation Error',
      errors: error.details.map(err => err.message),
    });
  }
  try {
    const community = await createCommunity(req.user._id, req.body);
    res.status(httpStatus.CREATED).json({ message: 'Community created successfully', community });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Server Error' });
  }
});

router.post('/join', validate, async (req, res) => {
  const { error } = joinCommunityValidator.body.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Validation Error',
      errors: error.details.map(err => err.message),
    });
  }
  try {
    await joinCommunity(req.user._id, req.body.communityId);
    res.status(httpStatus.OK).json({ message: 'Joined community successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;