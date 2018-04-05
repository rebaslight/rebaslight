var mkGradient = require('./mkGradient')

module.exports = {
  green: {
    name: 'Green',
    gradient: mkGradient([[0, 0, 0, 0], [128, 55, 192, 55], [246, 255, 255, 255], [256, 255, 255, 255]])
  },
  blue: {
    name: 'Blue',
    gradient: mkGradient([[0, 0, 0, 0], [128, 100, 100, 255], [246, 255, 255, 255], [256, 255, 255, 255]])
  },
  purple: {
    name: 'Purple',
    gradient: mkGradient([[0, 0, 0, 0], [128, 190, 61, 255], [246, 255, 255, 255], [256, 255, 255, 255]])
  },
  yellow: {
    name: 'Yellow',
    gradient: mkGradient([[0, 0, 0, 0], [171, 192, 192, 55], [246, 255, 255, 255], [256, 255, 255, 255]])
  },
  red: {
    name: 'Red',
    gradient: mkGradient([[0, 0, 0, 0], [128, 255, 50, 50], [246, 255, 255, 255], [256, 255, 255, 255]])
  }
}
