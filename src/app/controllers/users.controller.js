const User = require('../models/users.model')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

exports.getUserProfile = catchAsync(async (req, res) => {
   const { id } = req.user

   const user = await User.getUserProfile({ id })

   if (!user) throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

   return res.status(200).json({
      status: 'success',
      data: user,
   })
})

exports.updateUser = catchAsync(async (req, res) => {
   const { id } = req.user

   const user = await User.updateUser({ id, ...req.body })

   if (!user) throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

   return res.status(200).json({
      status: 'success',
      data: user,
   })
})

exports.disableMe = catchAsync(async (req, res) => {
   const { id } = req.user

   const user = await User.disableMe({ id })

   if (!user) throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

   return res.status(204).json()
})