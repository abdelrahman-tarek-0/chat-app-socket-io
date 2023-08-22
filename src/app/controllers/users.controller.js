const User = require('../models/users.model')
const resBuilder = require('../utils/responseBuilder')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

exports.getUserProfile = catchAsync(async (req, res) => {
   const { id } = req.user

   const user = await User.getUserProfile({ id })

   if (!user) throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

   return resBuilder(res, 200, 'User profile found', user)
})

exports.updateUser = catchAsync(async (req, res) => {
   const { id,  email_verified } = req.user

   const user = await User.updateUser({ id, email_verified, ...req.body })

   if (!user) throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

   return resBuilder(res, 200, 'User updated', user)
})

exports.disableMe = catchAsync(async (req, res) => {
   const { id } = req.user

   const user = await User.disableMe({ id })

   if (!user) throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

   return resBuilder(res, 204, 'User disabled', user)
})

exports.changePassword = catchAsync(async (req, res) => {
   const { id } = req.user

   const user = await User.changePassword({ id, ...req.body })

   if (!user) throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

   return resBuilder(res, 200, 'Password changed', user)
})
