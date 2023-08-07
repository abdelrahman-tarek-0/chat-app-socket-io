exports.userUnsafeFields = [
   'raw_id',
   'email',
   'email_verified',
   'phone_number',
   'password',
   'tokenizer',
   'last_password_change_at',
   'is_active',
   'updated_at',
]

exports.userSafeFields = ['id', 'name', 'image_url', 'bio', 'created_at']

exports.userAllowedUpdateFields = ['name', 'image_url', 'bio']

exports.safeUser = (user, unsafePass = {}) => {
   const safeUser = { ...user }

   this.userUnsafeFields.forEach((field) => {
      if (unsafePass[field]) return
      delete safeUser[field]
   })

   return safeUser
}

/**
 *
 * @param {Object} update the update object to update the user with
 * @returns {Object} the safe update object excluding unsafe fields
 */
exports.safeUserUpdate = (update) => {
   const safeUpdate = { ...update }

   Object.keys(update).forEach((field) => {
      if (!this.userAllowedUpdateFields.includes(field)) {
         delete safeUpdate[field]
      }
   })

   return safeUpdate
}

exports.channelUnsafeFields = [
   'raw_id',
   'is_active',
   'updated_at',
   'content_vector',
]
exports.channelSafeUpdateFields = ['name', 'description', 'image_url', 'type']
exports.channelSafeFields = [
   'id',
   'name',
   'description',
   'image_url',
   'type',
   'creator',
   'created_at',
]

exports.safeChannel = (channel, unsafePase = {}) => {
   const safeChannel = { ...channel }

   this.channelUnsafeFields.forEach((field) => {
      if (unsafePase[field]) return
      delete safeChannel[field]
   })

   return safeChannel
}

/**
 *
 * @param {Object} update the update object to update the Channel with
 * @returns {Object} the safe update object excluding unsafe fields
 */
exports.safeChannelUpdate = (update) => {
   const safeUpdate = { ...update }

   Object.keys(update).forEach((field) => {
      if (!this.channelSafeUpdateFields.includes(field)) {
         delete safeUpdate[field]
      }
   })

   return safeUpdate
}
