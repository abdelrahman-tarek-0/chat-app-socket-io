exports.randomNumber = (length) => {
   let random = ''

   for (let i = 0; i < length; i+=1) {
      const randomNumber = Math.floor(Math.random() * 10)
      random += randomNumber.toString()
   }

   return random
}

exports.randomString = (length) => {
   let random = ''
   const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

   for (let i = 0; i < length; i+=1) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      random += charset.charAt(randomIndex)
   }

   return random
}
