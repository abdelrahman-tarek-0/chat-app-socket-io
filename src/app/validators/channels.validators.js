const { body, param, query } = require('express-validator')
const { handleValidationErrors } = require('./base.validators')

exports.getChannel = [
    param('id')
        .trim()
        .isUUID(4)
        .withMessage('Channel id is not valid'),

    handleValidationErrors,
]


exports.getAllChannels = [
    query('order[by]')
        .optional()
        .trim()
        .isIn(['id', 'name', 'type', 'members_count', 'created_at'])
        .withMessage('Order by is not valid'),
    
    query('order[dir]')
        .optional()
        .trim()
        .isIn(['asc', 'desc'])
        .withMessage('Order direction is not valid'),

    query('pagination[page]')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Pagination page must be a number and greater than 0'),

    query('pagination[limit]')
        .optional()
        .trim()
        .isInt({ min: 1, max: 50 })
        .withMessage('Pagination limit must be a number between 1 and 50'),

    query('search') 
        .optional()
        .trim()
        .isLength( { max: 255 } )
        .withMessage('Search string must be less than 255 characters'),

    handleValidationErrors,
]