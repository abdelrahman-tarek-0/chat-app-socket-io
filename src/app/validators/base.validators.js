const { validationResult , matchedData } = require('express-validator');

const ErrorBuilder = require('../utils/ErrorBuilder');

exports.handleValidationErrors = (req, _res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new ErrorBuilder('Validation Failed', 422, 'VALIDATION_FAILED', errors.array());
        return next(error);
    }

    next();
}

exports.strict = (req, _res, next) =>  {
    req.body = matchedData(req, {
        locations: ['body'],
        onlyValidData: true,
        includeOptionals: true,
    });
    
    req.params = matchedData(req, {
        locations: ['params'],
        onlyValidData: true,
        includeOptionals: true,

    });

    req.query = matchedData(req, {
        locations: ['query'],
        onlyValidData: true,
        includeOptionals: true,

    });
    next();
}