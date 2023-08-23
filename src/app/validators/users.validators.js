const { body } = require('express-validator')
const { handleValidationErrors, strict } = require('./base.validators')

exports.updateUser = [
   body('display_name')
      .optional({ value: 'null' })
      .trim()
      .isLength({ min: 0, max: 255 })
      .withMessage('Display name must be less than 255 characters'),

   body('image_url')
      .optional({ value: 'null' })
      .trim()
      .isLength({ min: 0, max: 512 })
      .withMessage('Image url must be less than 512 characters'),

   body('bio')
      .optional({ value: 'null' })
      .trim()
      .isLength({ min: 0, max: 511 })
      .withMessage('Bio must be less than 511 characters'),

   body('phone_number')
      .optional({ value: 'null' })
      .trim()
      .isLength({ min: 0, max: 20 })
      .withMessage('Phone number must be less than 20 characters'),

   body('email')
      .optional({ value: 'null' })
      .trim()
      .isLength({ min: 8, max: 512 })
      .withMessage('Email must be between 8 to 512 characters')
      .isEmail()
      .withMessage('Email must be a valid email')
      .normalizeEmail({
         all_lowercase: true,
      }),

   handleValidationErrors,
   strict,
]

exports.changePassword = [
   body('oldPassword')
      .trim()
      .isLength({ max: 255 })
      .withMessage('Password must be less than 255 characters'),

   body('newPassword')
      .trim()
      .isLength({ min: 8, max: 255 })
      .withMessage('Password must be between 8 to 255 characters')
      .matches(
         /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-_=+[\]{}|;:'",.<>/?\\]{0,}$/
      )
      .withMessage('Password must contain at least one letter and one number'),

   handleValidationErrors,
   strict,
]
