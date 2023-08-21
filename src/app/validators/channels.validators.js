const { body, param } = require('express-validator')
const { handleValidationErrors } = require('./base.validators')

exports.getChannel = [
    param('id')
        .trim()
        .isUUID(4)
        .withMessage('Channel id is not valid'),

    handleValidationErrors,
]