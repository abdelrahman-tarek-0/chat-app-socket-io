const ChannelUser = require('../models/channels-users.model')

const { sendInvite } = require('../services/mail.services')

const catchAsync = require('../utils/catchAsync')

exports.createGeneralInvite = catchAsync(async (req, res) => {
   const { id } = req.params
   const { id: creatorId } = req.user

   const invite = await ChannelUser.createGeneralInvite(id, creatorId)

   res.status(201).json({
      status: 'success',
      data: 'http://localhost:3000/' + invite.alias,
   })
})

exports.createDirectInvite = catchAsync(async (req, res) => {
   const { id: channelId, targetName } = req.params
   const { id: creatorId } = req.user

   const { invite, channel, invited } = await ChannelUser.createDirectInvite(
      channelId,
      creatorId,
      targetName
   )

   await sendInvite({
      inviterName: req.user.username,
      channelName: channel.name,
      username: invited.username,
      email: invited.email,
      URL: 'http://localhost:3000/' + invite.alias,
   })

   res.status(201).json()
})

exports.acceptInvite = catchAsync(async (req, res) => {
   const { inviteId } = req.params
   const { id: userId } = req.user

   const { channel_id } = await ChannelUser.acceptInvite(inviteId, userId)

   res.redirect('api/v1/channels/' + channel_id)
})

exports.leaveChannel = catchAsync(async (req, res) => {
   const { id: channelId } = req.params
   const { id: userId } = req.user

   await ChannelUser.leaveChannel(channelId, userId)

   res.status(204).json()
})