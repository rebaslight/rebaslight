var h = require('virtual-dom/h')

module.exports = function (props) {
  return h('p', {style: {margin: '1em 0 .25em 0'}}, props.label)
}
