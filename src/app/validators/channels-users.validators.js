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

exports.createDirectInvite = [
    param('channelId')
        .trim()
        .isUUID(4)
        .withMessage('Channel ID is not valid')
        .isLength({ max: 64 })
        .withMessage('Channel ID must be less than 64 characters'),

    param('targetName')
        .trim()
        .isLength({ min: 8, max: 30 })
        .withMessage('Target name must be between 8 to 30 characters')
        .matches(/^[A-Za-z][A-Za-z0-9_@\-.]{0,}$/)
        .withMessage('Target name is not valid')
        .toLowerCase(),

    handleValidationErrors,
    strict,
]

exports.joinChannel = [
    param('channelId')
       .trim()
       .isUUID(4)
       .withMessage('Channel ID is not valid')
       .isLength({ max: 64 })
       .withMessage('Channel ID must be less than 64 characters'),
 
    handleValidationErrors,
    strict,
 ]