const Channel = require('../models/channels.model')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')
const { safeChannel } = require('../utils/safeModel')

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
   const { id: creatorId } = req.user

   const channels = await Channel.getAllChannels(creatorId)

   res.status(200).json({
      status: 'success',
      length: channels.length,
      data: {
         channels,
      },
   })
})

exports.updateChannel = catchAsync(async (req, res) => {
   const { id: channelId } = req.params
   const { id: creatorId } = req.user
   const update = req.body

   const channel = await Channel.updateChannel(channelId, creatorId, update)

   if (!channel?.id) {
      throw new ErrorBuilder('Channel not found', 404, 'NOT_FOUND')
   }

   res.status(200).json({
      status: 'success',
      data: {
         channel: safeChannel(channel,{
            updated_at: true,
         }),
      },
   })
})
