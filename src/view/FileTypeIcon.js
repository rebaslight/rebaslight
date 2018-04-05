var h = require('virtual-dom/h')

module.exports = function (type) {
  if (type === 'video') {
    return h('i.fa.fa-film')
  } else if (type === 'image') {
    return h('i.fa.fa-picture-o')
  }
}
