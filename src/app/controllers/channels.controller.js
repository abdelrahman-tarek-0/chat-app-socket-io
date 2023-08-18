const Channel = require('../models/channels.model')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

exports.getChannel = catchAsync(async (req, res) => {
   const { id: channelId } = req.params
   const { id: creatorId } = req.user

   const channel = await Channel.getChannel(channelId, creatorId)

   if (!channel?.id) {
      throw new ErrorBuilder('Channel not found', 404, 'NOT_FOUND')
   }

   res.status(200).json({
      status: 'success',
      data: {
         channel,
      },
   })
})

exports.getAllChannels = catchAsync(async (req, res) => {
   const { id: userId } = req.user
   console.log('req.query: ', req.query)

   const [meta, channels] = await Channel.getAllChannels(userId, {
      order: req.query.order,
      pagination: req.query.pagination,
      search: req.query.search,
   })

   res.status(200).json({
      status: 'success',
      ...meta,
      data: channels,
   })
})

exports.createChannel = catchAsync(async (req, res) => {
   const channel = await Channel.createChannel(req.user.id, req.body)

   res.status(201).json({
      status: 'success',
      data: {
         channel,
      },
   })
})

exports.updateChannel = catchAsync(async (req, res) => {
   const { id: channelId } = req.params
   const { id: creatorId } = req.user

   const channel = await Channel.updateChannel(channelId, creatorId, req.body)

   if (!channel?.id) {
      throw new ErrorBuilder(
         "Channel not found or You don't have access to do this action",
         404,
         'NOT_FOUND'
      )
   }

   res.status(200).json({
      status: 'success',
      data: {
         channel,
      },
   })
})

exports.deleteChannel = catchAsync(async (req, res) => {
   const { id: channelId } = req.params
   const { id: creatorId } = req.user

   const channel = await Channel.deleteChannel(channelId, creatorId)

   if (!channel?.id) {
      throw new ErrorBuilder(
         "Channel not found or You don't have access to do this action",
         404,
         'NOT_FOUND'
      )
   }

   res.status(204).json()
})

exports.createGeneralInvite = catchAsync(async (req, res) => {
   const { id } = req.params
   const { id: creatorId } = req.user

   const invite = await Channel.createGeneralInvite(id, creatorId)

   res.status(200).json({
      status: 'success',
      data: 'http://localhost:3000/' + invite.alias,
   })
})

exports.acceptInvite = catchAsync(async (req, res) => {
   const { inviteId } = req.params
   const { id: userId } = req.user

   const { channel_id } = await Channel.acceptInvite(inviteId, userId)

   res.redirect('api/v1/channels/' + channel_id)
})
