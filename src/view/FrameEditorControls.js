var h = require('virtual-dom/h')
var S = require('./styles')
var bus = require('../event-bus')
var Button = require('./Button')
var IconRotoscope = require('../icons/IconRotoscope')
var IconStar = require('../icons/IconStar')

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
    }, IconRotoscope()),
    Button({
      style: {display: 'block', width: btn_size_px, height: btn_size_px},
      active: !!state.preview_mode,
      'ev-click': bus.signal('set-preview_mode', true)
    }, IconStar())
  ])
}
