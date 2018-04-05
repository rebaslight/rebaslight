var h = require('virtual-dom/h')
var bus = require('../../event-bus')
var Modal = require('./Modal')
var css_vars = require('../common_css')

module.exports = function (state) {
  return Modal({
    title: 'Export Complete!',
    onClose: bus.signal('clear-exported_image_download_url')
  }, h('div', {style: {marginTop: '1em'}}, [
    h('a.' + css_vars.link, {href: state.exported_image_download_url, download: 'exported.png'}, '[ click here to download ]')
  ]))
}
