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

exports.createChannel = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Channel name must be between 1 and 255 characters'),

    body('description')
        .trim()
        .isLength({ min: 1, max: 1023 })
        .withMessage('Channel description must be between 1 and 1023 characters'),

    body('image_url')
        .optional()
        .trim()
        .isURL()
        .withMessage('Channel image url is not valid')
        .isLength({max: 512 })
        .withMessage('Channel image url must be less than 512 characters'),

    body('type')
        .trim()
        .isIn(['public', 'private'])
        .withMessage('Channel type must be public or private'),

    handleValidationErrors,
]

exports.updateChannel = [
    param('id')
        .trim()
        .isUUID(4)
        .withMessage('Channel id is not valid'),

    body('name')
        .optional()
        .trim() 
        .isLength({ min: 1, max: 255 })
        .withMessage('Channel name must be between 1 and 255 characters'),
        
    body('description') 
        .optional()
        .trim() 
        .isLength({ min: 1, max: 1023 })    
        .withMessage('Channel description must be between 1 and 1023 characters'),

    body('image_url')
        .optional()
        .trim()
        .isURL()
        .withMessage('Channel image url is not valid')
        .isLength({max: 512 })
        .withMessage('Channel image url must be less than 512 characters'),

    body('type')
        .optional() 
        .trim()
        .isIn(['public', 'private'])
        .withMessage('Channel type must be public or private'),

    handleValidationErrors,
]