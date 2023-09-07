const Message = require('../models/messages.model')
const resBuilder = require('../utils/responseBuilder')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

exports.getMessages = (mode) =>
   catchAsync(async (req, res, next) => {
      const id =
         mode === 'channel' ? req?.params?.channelId : req?.params?.bondId
         
      const messages = await Message.getMessages({
          id,
          mode,
      })

      return resBuilder(res, 200, 'messages retrieved successfully', messages)
   })
