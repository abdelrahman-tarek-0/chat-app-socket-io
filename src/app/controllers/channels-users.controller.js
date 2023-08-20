const ChannelUser = require('../models/channels-users.model')
const resBuilder = require('../utils/responseBuilder')

const { sendInvite } = require('../services/mail.services')

const catchAsync = require('../utils/catchAsync')

exports.createGeneralInvite = catchAsync(async (req, res) => {
   const { id } = req.params
   const { id: creatorId } = req.user

   const invite = await ChannelUser.createGeneralInvite(id, creatorId)

   return resBuilder(
      res,
      201,
      'Invite is created',
      `http://localhost:3000/${invite.alias}`
   )
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
      URL: `http://localhost:3000/${invite.alias}`,
   })

   return resBuilder(res, 201, `Invite is sent to ${targetName}`)
})

exports.acceptInvite = catchAsync(async (req, res) => {
   const { inviteId } = req.params
   const { id: userId } = req.user

   const { channel_id } = await ChannelUser.acceptInvite(inviteId, userId)

   return res.redirect(`api/v1/channels/${channel_id}`)
})

exports.joinChannel = catchAsync(async (req, res) => {
   const { id: channelId } = req.params
   const { id: userId } = req.user

   const channel = await ChannelUser.joinChannel(channelId, userId)

   // res.status(201).json({
   //    status: 'success',
   //    data: channel,
   // })
   return resBuilder(res, 201, `User join '${channel.name}'`, channel)
})

exports.leaveChannel = catchAsync(async (req, res) => {
   const { id: channelId } = req.params
   const { id: userId } = req.user

   await ChannelUser.leaveChannel(channelId, userId)

   return resBuilder(res, 204, `User left channel`)
})

exports.kickUser = catchAsync(async (req, res) => {
   const { id: channelId, userId: targetId } = req.params
   const { id: userId } = req.user

   await ChannelUser.kickUser(channelId, userId, targetId)

   return resBuilder(res, 204, `User '${targetId}' is kicked`)
})
