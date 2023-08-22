const Channel = require('../models/channels.model')
const resBuilder = require('../utils/responseBuilder')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

exports.getChannel = catchAsync(async (req, res) => {
   const { id: channelId } = req.params
   const { id: creatorId } = req.user

   const channel = await Channel.getChannel(channelId, creatorId)

   if (!channel?.id) {
      throw new ErrorBuilder('Channel not found', 404, 'NOT_FOUND')
   }

   return resBuilder(res, 200, 'Channel found', channel)
})

exports.getAllChannels = catchAsync(async (req, res) => {
   const { id: userId } = req.user
   console.log('req.query: ', req.query)

   const [meta, channels] = await Channel.getAllChannels(userId, req.query)

   return resBuilder(res, 200, 'Channels found', channels, meta)
})

exports.createChannel = catchAsync(async (req, res) => {
   const channel = await Channel.createChannel(req.user.id, req.body)

   return resBuilder(res, 201, 'Channel created', channel)
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

   return resBuilder(res, 200, 'Channel updated', channel)
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

   return resBuilder(res, 204, 'Channel deleted', channel)
})
