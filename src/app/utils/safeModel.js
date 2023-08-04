exports.userUnsafeFields = [
   'password',
   'tokenizer',
   'last_password_change_at',
   'raw_id',
   'email',
   'email_verified',
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
