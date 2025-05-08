const { getProfileSummary } = require('../services/posts');

const getProfileSummaryController = async (req, res) => {
  const { userId } = req.params;
  const summary = await getProfileSummary(userId);
  return summary;
};

module.exports = { getProfileSummary: getProfileSummaryController };