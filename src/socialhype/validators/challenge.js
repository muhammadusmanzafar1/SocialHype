// challengeValidator.js
const Joi = require('joi');

const hypeChallengeSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  status: Joi.string().valid('active', 'inactive', 'completed').default('active'),
});

module.exports = {
  hypeChallengeSchema,
};
