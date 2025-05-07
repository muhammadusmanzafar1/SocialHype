const express = require('express');
const router = express.Router();
const { validate } = require('../../../middlewares/auth');
const { getFollowing, getFollowers, followUser, acceptFollowRequest, unfollowUser } = require('../controllers/followersController');

router.get('/following/:userId', getFollowing);
router.get('/followers/:userId', getFollowers);

router.post('/follow', validate, followUser);

router.patch('/accept', validate, acceptFollowRequest);

router.delete('/unfollow', validate, unfollowUser);

module.exports = router;