var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('../styles')
var jsCSS = require('js-managed-css')

var logo_url = require('../../img/logo-transparent-100.png')

var padding = 20
var bar_height = 10
var bar_text_height = 20
var logo_height = 100

var max_width = 1000

var stripe_color = 'rgba(255,255,255,.25)'

var css_vars = jsCSS({
  '@keyframes $bar_stripes': {
    'from': {
      'background-position': '0 0'
    },
    'to': {
      'background-position': '40px 0'
    }
  },
  '.$progress_bar': {
    'height': bar_height + 'px',
    'background-size': '40px 40px',
    'transition': 'width .6s ease',
    'background-color': S.color.highlight,
    '&.$animated_stripes': {
      'animation': '$bar_stripes 1s linear infinite',
      'background-image': 'linear-gradient(-45deg,' + stripe_color + ' 25%,transparent 25%,transparent 50%,' + stripe_color + ' 50%,' + stripe_color + ' 75%,transparent 75%,transparent)'
    }
  },
  '.$cancel_btn': {
    'float': 'right',
    'cursor': 'pointer',
    'color': S.color.link_color,
    'text-decoration': 'none',
    ':hover': {
      'text-decoration': 'underline',
      'color': S.color.link_highlight
    }
  }
})

module.exports = function (props) {
  var bars = props.bars
  var y_offset = ((props.window_h - (padding * 2 + logo_height + _.size(bars) * (bar_height + bar_text_height))) / 2)

  return h('div', {
    style: S.xstyle.noselect({
      background: S.color.black_bg,
      margin: y_offset + 'px auto 0 auto',
      maxWidth: max_width + 'px',
      padding: padding + 'px',
      borderRadius: padding + 'px'
    })
  }, [
    h('div', {
      style: {
        color: S.color.text,
        lineHeight: logo_height + 'px',
        fontFamily: 'arial',
        fontSize: '40px'
      }
    }, [
      h('img', {src: logo_url,
        style: {
          float: 'left',
          marginRight: padding + 'px',
          height: logo_height + 'px'
        }}),
      'Rebaslight'
    ]),
    _.map(bars, function (bar) {
      var message = ''
      if (_.isString(bar.text)) {
        message += bar.text
      }
      if (_.isNumber(bar.percent) && !_.isNaN(bar.percent)) {
        if (message.length > 0) {
          message += ' (' + Math.floor(bar.percent) + '%)'
        } else {
          message += Math.floor(bar.percent) + '%'
        }
      }
      var has_percent = _.isNumber(bar.percent) && !_.isNaN(bar.percent)
      return [
        h('div', {
          style: {
            color: S.color.text,
            height: bar_text_height + 'px',
            lineHeight: bar_text_height + 'px',
            textAlign: 'center'
          }
        }, [
          bar.onCancel ? h('a.' + css_vars.cancel_btn, {
            href: '#',
            'ev-click': bar.onCancel
          }, '[cancel]') : null,
          message
        ]),
        h('div', {
          style: {
            height: bar_height + 'px',
            background: S.color.dark_bg
          }
        }, [
          h('div.' + css_vars.progress_bar + (has_percent ? '' : '.' + css_vars.animated_stripes), {
            style: {
              width: has_percent ? Math.min(bar.percent, 100) + '%' : '100%'
            }
          })
        ])
      ]
    })
  ])
}
