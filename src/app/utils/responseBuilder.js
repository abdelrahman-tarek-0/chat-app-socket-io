module.exports = (
   res,
   status = 200,
   message = '',
   data = null,
   additionalInfo = {}
) =>
   res.status(status).json({
      status: status < 400 ? 'success' : status < 500 ? 'fail' : 'error',
      message,
      ...additionalInfo,
      data,
   })
