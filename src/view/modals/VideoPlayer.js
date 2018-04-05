var h = require('virtual-dom/h')
var S = require('../styles')
var bus = require('../../event-bus')

var header_height = 30
var frame_border = 10
var padding = 10

module.exports = function (state) {
  var file_path = state.video_player_modal.file_path
  var window_h = state.window_h

  return h('div', {
    style: S.xstyle.noselect({
      position: 'fixed',
      top: frame_border + 'px',
      right: frame_border + 'px',
      bottom: frame_border + 'px',
      left: frame_border + 'px',
      background: S.color.black_bg,
      borderRadius: padding + 'px'
    })
  }, [
    h('div', {
      style: {
        padding: '0 ' + padding + 'px',
        position: 'relative',
        color: S.color.text,
        height: header_height + 'px',
        lineHeight: header_height + 'px'
      }
    }, [
      h('a', {
        href: '#',
        'ev-click': bus.signal('close-video_player_modal'),
        style: {
          position: 'absolute',
          right: '0px',
          lineHeight: header_height + 'px',
          width: '2em',
          textAlign: 'center',
          color: S.color.text,
          textDecoration: 'none',
          fontWeight: 'bold'
        }
      }, 'x'),
      file_path
    ]),
    h('video', {
      src: 'file://' + file_path,
      controls: 'controls',
      style: {
        width: '100%',
        height: 'auto',
        maxHeight: (window_h - frame_border - header_height - padding - frame_border) + 'px'
      }
    })
  ])
}
