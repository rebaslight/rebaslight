var h = require('virtual-dom/h')
var S = require('../styles')
var createElement = require('virtual-dom/create-element')

var padding = 10
var magnifier_size = S.sizes.left_panels - (2 * padding)
var cross_width = 2
var cross_size = 10

module.exports = function (orig_canvas) {
  var clip_size = 50// this may become an arg

  var canvas = createElement(h('canvas', {
    width: magnifier_size,
    height: magnifier_size,
    style: {
      display: 'none',
      position: 'fixed',
      top: (S.sizes.menu_height + padding) + 'px',
      left: padding + 'px',
      zIndex: S.z_indexes.magnifier,
      borderRadius: padding + 'px',
      border: '3px solid ' + S.color.border_highlight,
      background: '#000000'
    }
  }))

  var ctx = canvas.getContext('2d')
  ctx.lineWidth = cross_width
  ctx.strokeStyle = '#000'

  var is_visible = false

  return {
    canvas: canvas,
    render: function (mouse_state, showMagnifier) {
      if ((mouse_state && mouse_state.is_down) || showMagnifier) {
      } else {
        if (is_visible) {
          canvas.style.display = 'none'
          is_visible = false
        }
        return
      }
      if (!is_visible) {
        canvas.style.display = 'block'
        is_visible = true
      }
      ctx.clearRect(0, 0, magnifier_size, magnifier_size)
      ctx.drawImage(
        orig_canvas,
        mouse_state.x - (clip_size / 2),
        mouse_state.y - (clip_size / 2),
        clip_size,
        clip_size,
        0,
        0,
        magnifier_size,
        magnifier_size
      )

      var cx = magnifier_size / 2
      var cy = magnifier_size / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy - cross_size)
      ctx.lineTo(cx, cy + cross_size)
      ctx.moveTo(cx - cross_size, cy)
      ctx.lineTo(cx + cross_size, cy)
      ctx.closePath()
      ctx.stroke()
    }
  }
}
