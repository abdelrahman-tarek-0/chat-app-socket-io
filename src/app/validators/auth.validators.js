const { body } = require('express-validator')
const { handleValidationErrors,strict } = require('./base.validators')

exports.signup = [
   body('username')
      .trim()
      .isLength({ min: 8, max: 30 })
      .withMessage('Username must be between 8 to 30 characters')
      .matches(/^[A-Za-z][A-Za-z0-9_@\-.]{0,}$/)
      .withMessage(
         'Username must start with a letter and can only contain letters, numbers, and _@-.'
      )
      .toLowerCase(),

   body('display_name')
      .optional({ values: 'null' })
      .trim()
      .isLength({ min: 0, max: 255 })
      .withMessage('Display name must be less than 255 characters'),

   body('email')
      .trim()
      .isEmail()
      .withMessage('Email must be a valid email')
      .normalizeEmail({
         all_lowercase: true,
      })
      .isLength({ min: 8, max: 512 })
      .withMessage('Email must be between 8 to 512 characters'),

   body('password')
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

exports.login = [
   body('email')
      .trim()
      .isEmail()
      .withMessage('Email must be a valid email')
      .normalizeEmail({
         all_lowercase: true,
      })
      .isLength({ max: 512 })
      .withMessage('Email must be less than 512 characters'),

   body('password')
      .trim()
      .isLength({ max: 255 })
      .withMessage('Password must be less than 255 characters'),

   handleValidationErrors,
   strict,
]

exports.forgetPassword = [
   body('email')
      .trim()
      .isEmail()
      .withMessage('Email must be a valid email')
      .normalizeEmail({
         all_lowercase: true,
      })
      .isLength({ max: 512 })
      .withMessage('Email must be less than 512 characters'),

   handleValidationErrors,
   strict,
]

exports.resetPassword = [
   body('id')
      .trim()
      .isUUID(4)
      .withMessage('ID is not in valid format')
      .isLength({ max: 64 })
      .withMessage('ID must be less than 64 characters'),

   body('token')
      .trim()
      .isLength({ max: 64 })
      .withMessage('Token must be less than 64 characters'),

   body('password')
      .trim()
      .isLength({ min: 8, max: 255 })
      .withMessage('Password must be between 8 to 255 characters')
      .matches(
         /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-_=+[\]{}|;:'",.<>/?\\]{0,}$/
      )
      .withMessage(
         'Password must contain at least one letter and one number or special character'
      ),
      
   handleValidationErrors,
   strict,
]
