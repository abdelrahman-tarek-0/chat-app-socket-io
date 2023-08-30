const User = require('../models/users.model')
const resBuilder = require('../utils/responseBuilder')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

exports.getCurrentUserData = catchAsync(async (req, res) => {
   const { id } = req.user
   let { fields } = req.query

   fields = fields?.split(',') || []

   const user = await User.getCurrentUserData({ id }, { fields })

   if (!user) throw new ErrorBuilder('User not found', 404, 'USER_NOT_FOUND')

   return resBuilder(res, 200, 'User profile found', user)
})

exports.updateUser = catchAsync(async (req, res) => {
   const { id, email_verified } = req.user

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

exports.sendBondRequest = catchAsync(async (req, res) => {
   const { id: requesterId } = req.user
   const { username: requestedUsername } = req.params

   const bondRequest = await User.sendBondRequest({ requesterId, requestedUsername })

   return resBuilder(res, 200, 'Bond request sent', bondRequest)
})

exports.acceptBondRequest = catchAsync(async (req, res) => {
   const { id: requestedId } = req.user
   const { bondRequestId } = req.params

   const bond = await User.acceptBondRequest({ bondRequestId, requestedId })

   return resBuilder(res, 200, 'Bond accepted', bond)
})

exports.breakBond = catchAsync(async (req, res) => {
   const { id: userId } = req.user
   const { bondId } = req.params

   const bond = await User.breakBond({ bondId, userId })

   return resBuilder(res, 200, 'Bond broken', bond)
})