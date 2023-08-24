const { body, param } = require('express-validator')
const { handleValidationErrors, strict } = require('./base.validators')

exports.createGeneralInvite = [
   param('channelId')
      .trim()
      .isUUID(4)
      .withMessage('Channel ID is not valid')
      .isLength({ max: 64 })
      .withMessage('Channel ID must be less than 64 characters'),

   handleValidationErrors,
   strict,
]
