module.exports = (
   res,
   status = 200,
   message = '',
   data = null,
   additionalInfo = {}
) => {
   return res.status(status).json({
      status,
      message,
      data,
      ...additionalInfo,
   })
}
