var h = require('virtual-dom/h')
var S = require('./styles')
var jsCSS = require('js-managed-css')

var css_vars = jsCSS({
  'button.$btn': {
    'color': S.color.text,
    'border': '1px solid ' + S.color.border,
    'padding': '.5em 1em',
    'border-radius': '.5em',
    'background': 'linear-gradient(to bottom, ' + S.color.gradient.button + ')',
    ':hover': {
      'background': 'linear-gradient(to bottom, ' + S.color.gradient.button_hover + ')'
    },
    '&.$active, :active': {
      'background': 'linear-gradient(to bottom, ' + S.color.gradient.button_active + ')',
      ':hover': {
        'background': 'linear-gradient(to bottom, ' + S.color.gradient.button_active_hover + ')'
      }
    },
    ':focus': {
      'outline': 'none !important',
      'border-color': S.color.border_highlight + ' !important'
    }
  }
})

module.exports = function (props, body) {
  var style = props.style || {}
  var active = props.active
  var onClick = props.onClick || props.onclick || props['ev-click']

  return h('button.' + css_vars.btn + (active ? '.' + css_vars.active : ''), {
    'ev-click': onClick,
    style: style
  }, body)
}
