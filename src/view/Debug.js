var h = require('virtual-dom/h')
var S = require('./styles')

module.exports = function (state) {
  if (S.sizes.Debug_width === 0) {
    return null
  }
  var str = JSON.stringify(state, false, 2)

  return h('div', {
    style: {overflow: 'auto', height: '100%'}
  }, h('pre', str))
}
