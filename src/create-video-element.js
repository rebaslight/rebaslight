var _ = require('lodash')
var h = require('virtual-dom/h')
var createElement = require('virtual-dom/create-element')

module.exports = function (src, o) {
  var elm = createElement(h('video', {src: src}))
  var listners = {}
  if (_.isFunction(o && o.onSeeked)) {
    listners['seeked'] = function () {
      o.onSeeked(elm.currentTime)
    }
  }
  if (_.isFunction(o && o.onMounted)) {
    listners['loadeddata'] = function () {
      o.onMounted(elm)
    }
  }
  if (_.isFunction(o && o.onError)) {
    listners['error'] = function (ev) {
      o.onError(ev)
    }
  }
  _.forEach(listners, function (fn, name) {
    elm.addEventListener(name, fn, false)
  })
  return {
    elm: elm,
    destroy: function () {
      _.forEach(listners, function (fn, name) {
        elm.removeEventListener(name, fn, false)
      })
      // Anything else???
    }
  }
}
