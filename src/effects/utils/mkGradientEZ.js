var flatInt = require('../../flatInt')
var mkGradient = require('./mkGradient')

var mkSpec = function (pos, red, green, blue, hiTone) {
  var getHiTone = function (color) {
    return flatInt(255 - hiTone + (color / 255.0) * hiTone)
  }

  return [
    [0, 0, 0, 0],
    [pos, red, green, blue],
    [255, getHiTone(red), getHiTone(green), getHiTone(blue)]
  ]
}

module.exports = function (pos, red, green, blue, hiTone) {
  return mkGradient(mkSpec(pos, red, green, blue, hiTone).concat([
    [256, 255, 255, 255]
  ]))
}
module.exports.mkSpec = mkSpec
