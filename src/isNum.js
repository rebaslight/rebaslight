var _ = require('lodash')

module.exports = function (n) {
  return _.isNumber(n) && !_.isNaN(n)
}
