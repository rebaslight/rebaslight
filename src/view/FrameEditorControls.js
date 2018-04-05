// var _ = require("lodash");
var h = require('virtual-dom/h')
var S = require('./styles')
var bus = require('../event-bus')
var Button = require('./Button')

module.exports = function (state) {
  var btn_size_px = (S.sizes.FrameEditorControls_width - 1) + 'px'
  return h('div', {
    style: S.xstyle.absolute({
      color: S.color.text,
      background: S.color.main_bg
    })
  }, [
    Button({
      style: {display: 'block', width: btn_size_px, height: btn_size_px},
      active: !state.preview_mode,
      'ev-click': bus.signal('set-preview_mode', false)
    }, h('i.fa.fa-code-fork')),
    Button({
      style: {display: 'block', width: btn_size_px, height: btn_size_px},
      active: !!state.preview_mode,
      'ev-click': bus.signal('set-preview_mode', true)
    }, h('i.fa.fa-star-o'))
  ])
}
