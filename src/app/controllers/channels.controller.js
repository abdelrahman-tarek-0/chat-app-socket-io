const Channel = require('../models/channels.model')

const ErrorBuilder = require('../utils/ErrorBuilder')
const catchAsync = require('../utils/catchAsync')

exports.getChannelMetadata = catchAsync(async (req, res) => {
    const { id:channelId } = req.params
    const { id: creator_id } = req.user
    
    const channel = await Channel.getChannelMetadata(channelId, creator_id)
    
    if (!channel) {
        throw new ErrorBuilder('Channel not found', 404)
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            channel,
        },
    })
})