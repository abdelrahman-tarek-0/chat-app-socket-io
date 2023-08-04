/**
 * @description error builder
 * @param {string} message - Error message
 * @param {number} statusCode - response status code
 * @param {string} code - Error code
 * @returns {Error} - the error object
 * @example ErrorBuilder('Invalid email or password', 401, 'INVALID_CREDENTIALS')
 */
class ErrorBuilder extends Error {
   constructor(message, statusCode, code) {
      super()
      this.code = code || null
      this.statusCode = statusCode || 500
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
      this.isOperational = true
      this.message = message || 'Something went wrong'

      Error.captureStackTrace(this, this.constructor)
   }
}

module.exports = ErrorBuilder
