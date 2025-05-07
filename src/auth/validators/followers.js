const Joi = require('joi');

const followUserValidator = {
    body: Joi.object({
        userId: Joi.string().required(),
    }),
};

const acceptFollowRequestValidator = {
    body: Joi.object({
        requesterId: Joi.string().required(),
    }),
};

const unfollowUserValidator = {
    body: Joi.object({
        userId: Joi.string().required(),
    }),
};

module.exports = {
    followUserValidator,
    acceptFollowRequestValidator,
    unfollowUserValidator,
};