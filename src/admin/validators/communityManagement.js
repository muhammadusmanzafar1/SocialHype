const joi = require('joi');

const coerceArray = (val) => {
    if (typeof val === 'string') {
      return val.includes(',') ? val.split(',').map(s => s.trim()) : [val];
    }
    return val;
  };

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
      moderators: joi.array().items(joi.string()).optional().custom(coerceArray),
      members: joi.array().items(joi.string()).optional().custom(coerceArray),
    })
  }

exports.updateCommunityValidator = {
  body: joi.object().keys({
    name: joi.string().required(),
    description: joi.string().optional(),
    type: joi.string().valid('public', 'private', 'paid').required(),
    status: joi.string().valid('active', 'inactive').default('active'),
    avatarUrl: joi.string().uri().optional(),
    bannerUrl: joi.string().uri().optional(),
    fee: joi.number().min(0).default(0).optional(),
    adminId: joi.string().optional(),
    moderators: joi.array().items(joi.string()).optional().custom(coerceArray),
    members: joi.array().items(joi.string()).optional().custom(coerceArray),
  })
}