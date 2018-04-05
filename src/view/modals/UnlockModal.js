var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('../styles')
var bus = require('../../event-bus')
var Modal = require('./Modal')
var jsCSS = require('js-managed-css')
var Button = require('../Button')
var prevDflt = require('wrap-prevent-default')
var css_vars = require('../common_css')

var license_url = 'https://github.com/rebaslight/rebaslight/blob/master/LICENSE.md'
var buy_now_img = require('../../img/buy-now.png')

var css = jsCSS({
  'input.$text-input': {
    'display': 'block',
    'border': '1px solid ' + S.color.black_bg,
    'padding': '.25em .5em',
    'border-radius': '.25em',
    'box-sizing': 'border-box',
    'color': S.color.text,
    'width': '100%',
    'background-color': S.color.dark_bg,
    ':focus': {
      'outline': 'none !important',
      'border-color': S.color.border_highlight + ' !important'
    }
  }
})

var formNodeToData = function (form_node) {
  var data = {}
  var elms = form_node.elements
  var i = 0
  while (i < elms.length) {
    var elm = elms[i]
    i += 1
    if (_.isString(elm.name) && elm.name.length > 0) {
      data[elm.name] = elm.value
    }
  }
  return data
}

module.exports = function (state) {
  var onClose = bus.signal('UnlockModal-hide')
  if (state.unlocked) {
    return Modal({
      title: 'Unlocked!',
      onClose: onClose,
      buttons: []
    }, h('div', [
      h('p', [
        'Thank you for purchasing a user license!'
      ]),
      h('p', [
        h('a.' + css_vars.link, {href: license_url}, 'License Agreement')
      ]),
      h('a.' + css_vars.link, {
        href: '#',
        'ev-click': bus.signal('UnlockModal-unsign'),
        style: {
          float: 'right'
        }
      }, 'remove'),
      'Your Signature:',
      h('div', {
        style: {
          fontFamily: 'monospace',
          background: S.color.light_bg,
          borderRadius: '10px',
          padding: '10px',
          margin: '5px 0 10px 0'
        }
      }, state.unlocked),
      h('div', [
        Button({onClick: prevDflt(onClose)}, 'Ok'),
        h('a.' + css_vars.link, {
          href: '#',
          'ev-click': bus.signal('UnlockModal-unsign'),
          style: {
            marginLeft: '1em'
          }
        }, 'un-sign')
      ])
    ]))
  }
  return Modal({
    title: 'Trial Version',
    onClose: onClose,
    buttons: []
  }, h('form', {'ev-submit': function (e) {
    e.preventDefault()
    var data = formNodeToData(e.target)
    if (!_.isString(data.signature) || (data.signature.trim().length === 0)) {
      return
    }
    var str = data.signature
    str += ' on ' + (new Date()).toISOString()
    bus.emit('sign-to-unlock', str)
  }}, [
    h('p', [
      'Thank you for trying Rebaslight.'
    ]),
    h('p', {style: {lineHeight: '1.4'}}, [
      'To remove the watermarks and get full-access forever, please purchase the ',
      h('b', {style: {fontFamily: 'monospace'}}, ['$25']),
      ' "Rebaslight user license" (one per user).',
      ' Full-access forever means you automatically get new versions and/or effects at no additional cost.',
      ' For more info see the ',
      h('a.' + css_vars.link, {href: license_url}, 'License Agreement'),
      '.'
    ]),
    h('p', {
      style: {margin: '1.5rem 0'}
    }, [
      h('a.' + css_vars.link, {
        href: 'https://buy.rebaslight.com/',
        _target: 'blank'
      }, [
        h('img', {
          src: buy_now_img,
          alt: 'buy.rebaslight.com',
          style: {marginLeft: '1rem'}
        })
      ])
    ]),
    h('p', [
      'If you purchased the license, then sign here:'
    ]),
    h('div', [
      h('table', {style: {width: '100%'}}, [
        h('tbody', [
          h('tr', [
            h('td', [
              h('input.' + css['text-input'], {
                'name': 'signature',
                'type': 'text'
              })
            ]),
            h('td', {style: {textAlign: 'center'}}, [
              ((new Date()).getMonth() + 1),
              '/',
              (new Date()).getDate(),
              '/',
              (new Date()).getFullYear()
            ])
          ]),
          h('tr', [
            h('td', {style: {textAlign: 'center'}}, [
              'Name'
            ]),
            h('td', {style: {textAlign: 'center'}}, [
              'Date'
            ])
          ])
        ])
      ])
    ]),
    h('div', {style: {margin: '10px 0'}}, [
      Button({}, 'Sign'),
      h('a.' + css_vars.link, {
        href: '#',
        'ev-click': onClose,
        style: {
          marginLeft: '1em'
        }
      }, 'Nevermind, stay in trial mode')
    ])
  ]))
}
