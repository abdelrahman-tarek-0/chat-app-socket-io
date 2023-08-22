exports.userUnsafeFields = [
   'raw_id',
   // 'email',
   // 'email_verified',
   'phone_number',
   'password',
   'tokenizer',
   'last_password_change_at',
   'is_active',
   'updated_at',
]

exports.safeUser = (user, unsafePass = {}) => {
   const safeUser = { ...user }

   this.userUnsafeFields.forEach((field) => {
      if (unsafePass[field]) return
      delete safeUser[field]
   })

   return safeUser
}



exports.channelUnsafeFields = [
   'raw_id',
   'is_active',
   'updated_at',
   'content_vector',
]



exports.safeChannel = (channel, unsafePase = {}) => {
   const safeChannel = { ...channel }

   this.channelUnsafeFields.forEach((field) => {
      if (unsafePase[field]) return
      delete safeChannel[field]
   })

   return safeChannel
}
