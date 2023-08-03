/**
 * @description - A wrapper function to catch async errors
 * @param {Function} fn - Express async function
 */
const catchAsync =
   (fn) =>
   (...args) =>
      fn(...args).catch(args[args.length - 1])

module.exports = catchAsync