var IconFilm = require('../icons/IconFilm')
var IconPhoto = require('../icons/IconPhoto')

module.exports = function (type) {
  if (type === 'video') {
    return IconFilm()
  } else if (type === 'image') {
    return IconPhoto()
  }
}
