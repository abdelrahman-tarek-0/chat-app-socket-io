exports.randomNumber = (length) => {
   let random = ''

   for (let i = 0; i < length; i += 1) {
      const randomNumber = Math.floor(Math.random() * 10)
      random += randomNumber.toString()
   }

   return random
}

const charsetMapper = {
   number: '0123456789',
   lower: 'abcdefghijklmnopqrstuvwxyz',
   upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
   all: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
   alpha: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
   lowNum : '0123456789abcdefghijklmnopqrstuvwxyz',
   upNum : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
}

exports.randomString = (length,charset) => {
   let random = ''

   charset = charsetMapper[charset] || charset || charsetMapper.all

   for (let i = 0; i < length; i += 1) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      random += charset.charAt(randomIndex)
   }

   return random
}
