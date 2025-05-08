const Joi = require('joi');

const followValidator = {
  body: Joi.object({
    userId: Joi.string().required(),
  }),
};

const acceptFollowValidator = {
  body: Joi.object({
    requesterId: Joi.string().required(),
  }),
};

const unfollowValidator = {
  body: Joi.object({
    userId: Joi.string().required(),
  }),
};

module.exports = { followValidator, acceptFollowValidator, unfollowValidator };