var flatInt = require('./flatInt')

module.exports = function (v1, v2, t1, t, t2) {
  var tdiff = t2 - t1
  var m = (v2 - v1) / tdiff
  var b = v1 - m * t1
  return flatInt(m * t + b)
}
