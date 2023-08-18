module.exports = (
   res,
   status = 200,
   message = '',
   data = null,
   additionalInfo = {}
) => {
   return res.status(status).json({
      status: status < 400 ? 'success' : status < 500 ? 'fail' : 'error',
      message,
      ...additionalInfo,
      data,
   })
}
