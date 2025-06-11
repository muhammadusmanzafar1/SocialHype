const Joi = require('joi');
const mongoose = require('mongoose');

exports.postValidationSchema = Joi.object({
  content: Joi.string().trim().required(),
  media: Joi.array().items(Joi.string().uri()).default([]),
  isHypeChallenge: Joi.boolean().default(false).optional(),
  challengeId: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional(),
  interests: Joi.array().items(Joi.string()).default([]),
  taggedPeople: Joi.array()
    .items(Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }))
    .default([]),
  status: Joi.string()
    .valid('Public', 'Friends', 'Private', 'Restricted', 'disabled')
    .default('Public'),
});
