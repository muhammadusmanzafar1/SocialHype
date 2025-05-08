const Joi = require('joi');

const createCommunityValidator = {
  body: Joi.object({
    name: Joi.string().required().trim().max(100),
    description: Joi.string().trim().max(500).allow(''),
  }),
};

const joinCommunityValidator = {
  body: Joi.object({
    communityId: Joi.string().required(),
  }),
};

module.exports = { createCommunityValidator, joinCommunityValidator };