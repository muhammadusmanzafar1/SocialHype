const express = require('express');
const router = express.Router();
const profileController = require('../controllers/userProfileController.js');

router.get('/profile/:userId', profileController.getProfile);
router.put('/profile/edit', profileController.editProfile);
router.patch('/profile/creator/register', profileController.registerCreator);
router.patch('/creator/unregister',  profileController.unregisterAsCreator);
router.patch('/creator/change-price', profileController.changeExclusivePrice);

module.exports = router;
