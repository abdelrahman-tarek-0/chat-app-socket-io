const Message = require('../models/messages.model')
const resBuilder = require('../utils/responseBuilder')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

exports.getBondMessages = catchAsync(async (req, res) => {

   const messages = await Message.getBondMessages({
      bondId: req?.params?.bondId,
      userId: req?.user?.id,
   })

   return resBuilder(res, 200, 'messages retrieved successfully', messages)
})
