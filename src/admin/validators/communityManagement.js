const joi = require('joi');

exports.createCommunityValidator = {
    body: joi.object().keys({
        name: joi.string().required(),
        description: joi.string().optional(),
        type: joi.string().valid('public', 'private', 'paid').required(),
        status: joi.string().valid('active', 'inactive').default('active'),
        avatarUrl: joi.string().uri().optional(),
        bannerUrl: joi.string().uri().optional(),
        fee: joi.number().min(0).default(0).optional(),
        adminId: joi.string().required(),
        moderators: joi.array().items(joi.string()).optional(),
        members: joi.array().items(joi.string()).optional(),
    })
}

exports.updateCommunityValidator = {
    body: joi.object().keys({
        name: joi.string().optional(),
        description: joi.string().optional(),
        type: joi.string().valid('public', 'private', 'paid').optional(),
        status: joi.string().valid('active', 'inactive').optional(),
        avatarUrl: joi.string().uri().optional(),
        bannerUrl: joi.string().uri().optional(),
        fee: joi.number().min(0).optional(),
    })
}