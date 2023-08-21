const { validationResult } = require('express-validator');

const ErrorBuilder = require('../utils/ErrorBuilder');

exports.handleValidationErrors = (req, _res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new ErrorBuilder('Validation Failed', 422, 'VALIDATION_FAILED', errors.array());
        return next(error);
    }

    next();
}