const Joi = require('joi');
const mongoose = require('mongoose');

exports.postValidationSchema = Joi.object({
  title: Joi.string().trim().required(),
  content: Joi.string().trim().required(),
  media: Joi.array().items(Joi.string().uri()).default([]),
  isHypeChallenge: Joi.boolean().default(false),
  challengeId: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  status: Joi.string()
    .valid('Public', 'Friends', 'Private', 'Restricted', 'disabled')
    .default('Public'),
});
