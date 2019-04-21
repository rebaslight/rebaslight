var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('../styles')
var bus = require('../../event-bus')
var jsCSS = require('js-managed-css')
var Layer = require('./Layer')
var MainSource = require('./MainSource')

var css = jsCSS({
  'h3.$title': {
    'margin-top': '0',
    'margin-bottom': '1.5em',
    'border-bottom': '1px solid ' + S.color.border_highlight,
    'padding-bottom': '.25em',
    '.$delete_btn': {
      'cursor': 'pointer',
      'float': 'right',
      'color': S.color.link_color,
      ':hover': {
        'color': S.color.link_highlight
      }
    }
  },
  'div.$alert': {
    cursor: 'pointer',
    background: '#f2dede',
    margin: '50px 0 0 0',
    padding: '10px',
    'border-radius': '10px',
    color: '#a94442',
    border: '1px solid #ebccd1',
    'a.$link': {
      'color': '#2525f4',
      'text-decoration': 'none',
      ':hover': {
        'color': '#5555f6',
        'text-decoration': 'underline'
      }
    }
  }
})

module.exports = function (state) {
  var layer = _.find(state && state.current_project && state.current_project.layers, function (layer) {
    return layer.id === (state && state.open_layer_id)
  })
  var main_source = state && state.current_project && state.current_project.main_source

  var title
  var body
  var delete_action
  if (layer) {
    title = layer.name
    body = Layer(layer)
    delete_action = bus.signal('delete-layer', layer.id)
  } else if (main_source) {
    title = 'Main Source'
    body = MainSource(main_source)
    delete_action = bus.signal('delete-project')
  }

  return h('div', {
    style: S.xstyle.absolute({
      color: S.color.text,
      background: S.color.main_bg,
      padding: '1em',
      overflowX: 'hidden',
      overflowY: 'auto'
    })
  }, [
    title ? h('h3.' + css.title, [
      delete_action ? h('i.fa.fa-trash.' + css.delete_btn, {
        'ev-click': delete_action
      }) : null,
      title
    ]) : null,
    body,
    state.unlocked
      ? h('span')
      : h('div.' + css.alert, {
        'ev-click': bus.signal('UnlockModal-show')
      }, [
        'To remove the "Made with Rebaslight" watermark please ',
        h('a.' + css.link, {
          href: '#',
          'ev-click': bus.signal('UnlockModal-show')
        }, 'pay here'),
        '.'
      ])
  ])
}
