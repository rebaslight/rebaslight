var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('../styles')
var getIn = require('get-in')
var jsCSS = require('js-managed-css')
var Delegator = require('dom-delegator')

var height = 10
var border_w = 2
var handle_w = height

var css_names = jsCSS({
  '.$handle': {
    ':hover, &.$active': {
      'border-color': S.color.border_highlight + ' !important',
      'background': 'linear-gradient(to right, ' + S.color.gradient.slider_handle_active + ') !important'
    }
  }
})

var getSliderBar = function (DOM_main) {
  return getIn(DOM_main, ['children', 0, 'children', 0])
}
var getSliderHandle = function (DOM_main) {
  return getIn(DOM_main, ['children', 1])
}

var updateSliderPosition = function (DOM_main, pos) {
  var DOM_bar = getSliderBar(DOM_main)
  if (DOM_bar) {
    DOM_bar.style.width = pos + 'px'
  }
  var DOM_handle = getSliderHandle(DOM_main)
  if (DOM_handle) {
    DOM_handle.style.left = (pos - (handle_w / 2)) + 'px'
  }
}

var startDrag = function (ev, onPos, DOM_main) {
  ev.preventDefault()// prevent it from selecting text as you drag

  var slider_rect = DOM_main.getBoundingClientRect()
  var x = slider_rect.left
  var w = slider_rect.width

  var DOM_handle = getSliderHandle(DOM_main)
  if (DOM_handle) {
    DOM_handle.classList.add(css_names.active)
  }

  var update = function (ev2, type) {
    var pos = Math.max(0, Math.min(w, ev2.pageX - x))
    updateSliderPosition(DOM_main, pos)
    onPos(pos, w)
    if (type === 'up') {
      var DOM_handle = getSliderHandle(DOM_main)
      if (DOM_handle) {
        DOM_handle.classList.remove(css_names.active)
      }
    }
  }

  var delegator = Delegator()

  update(ev, 'down')
  var onMove = function (ev2) {
    update(ev2, 'move')
  }
  var onUp = function (ev2) {
    update(ev2, 'up')
    delegator.unlistenTo('mousemove')
    delegator.removeGlobalEventListener('mousemove', onMove)
    delegator.removeGlobalEventListener('mouseup', onUp)
  }
  delegator.listenTo('mousemove')
  delegator.addGlobalEventListener('mousemove', onMove)
  delegator.addGlobalEventListener('mouseup', onUp)
}

function Hook (props) {
  this.slot = props.slot
  this.slots = Math.max(1, props.slots)// to avoid division by 0
}

Hook.prototype.hook = function (DOM_main, property_name, prevHook) {
  if (!DOM_main) {
    return
  }
  var DOM_handle = getSliderHandle(DOM_main)
  if (DOM_handle && DOM_handle.classList.contains(css_names.active)) {
    return// don't update until they are done sliding
  }
  var w = DOM_main.offsetWidth
  var pos = ((this.slot * w) / this.slots)
  updateSliderPosition(DOM_main, pos)
  if (w < 1) {
    var self = this
    setTimeout(function () {
      var w = DOM_main.offsetWidth
      var pos = ((self.slot * w) / self.slots)
      updateSliderPosition(DOM_main, pos)
    }, 1)
  }
}

var domWalkUpFn = _.memoize(function (n) {
  return function (d) {
    var i
    for (i = 0; i < n; i += 1) {
      d = d && d.parentElement
    }
    return d
  }
})

module.exports = function (props) {
  var slots = Math.max(1, props.slots)// to avoid division by 0
  var onChange = props.onChange
  var area_height = props.area_height || (2 * height + 2 * border_w)

  var onPos = _.throttle(function (pos, w) {
    onChange(Math.floor((pos * slots) / w))
  }, 500)

  var mkMouseDown = function (fn) {
    return function (ev) {
      startDrag(ev, onPos, fn(ev.target))
    }
  }

  return h('div', {
    'hook': new Hook(props),
    'ev-mousedown': mkMouseDown(domWalkUpFn(0)),
    style: {
      position: 'relative',
      height: area_height + 'px'
    }
  }, [
    h('div', {
      'ev-mousedown': mkMouseDown(domWalkUpFn(1)),
      style: {
        position: 'absolute',
        top: ((area_height - height - 2 * border_w) / 2) + 'px',
        left: 0,
        right: 0,
        border: border_w + 'px solid ' + S.color.border,
        height: height + 'px'
      }
    }, h('div', {
      'ev-mousedown': mkMouseDown(domWalkUpFn(2)),
      style: {
        background: 'linear-gradient(to bottom, ' + S.color.gradient.slider + ')',
        width: 0,
        height: height + 'px'
      }
    })),
    h('div.' + css_names.handle, {
      'ev-mousedown': mkMouseDown(domWalkUpFn(1)),
      style: {
        position: 'absolute',
        top: ((area_height - (2 * height + 2 * border_w)) / 2) + 'px',
        left: 0 - (handle_w / 2),
        width: handle_w + 'px',
        cursor: 'pointer',
        height: (2 * height) + 'px',
        border: border_w + 'px solid ' + S.color.border,
        zIndex: S.z_indexes.slider_handle,
        background: 'linear-gradient(to right, ' + S.color.gradient.slider_handle + ')',
        borderRadius: handle_w + 'px'
      }
    })
  ])
}
