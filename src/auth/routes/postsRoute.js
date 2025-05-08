const express = require('express');
const router = express.Router();
const httpStatus = require('http-status');
const { getProfileSummary } = require('../controllers/postsController');

router.get('/profile-summary/:userId', async (req, res) => {
  try {
    const summary = await getProfileSummary(req.params.userId);
    res.status(httpStatus.OK).json({ message: 'Profile summary retrieved', data: summary });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Server Error' });
  }
});

module.exports = router;