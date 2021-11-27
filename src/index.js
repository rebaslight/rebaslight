var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('./view/styles')
var bus = require('./event-bus')
var vdomHB = require('./vdom-hb')
var AbsoluteLayout = require('virtual-dom-absolute-layout')
var getTimelineHeight = require('./getTimelineHeight')
var getNFramesForProject = require('./getNFramesForProject')

var Menu = require('./view/Menu')
var Debug = require('./view/Debug')
var Modals = require('./view/modals')
var Timeline = require('./view/Timeline')
var EffectPanel = require('./view/EffectPanel')
var FrameEditor = require('./view/FrameEditor')
var MainSourceBar = require('./view/MainSourceBar')
var VerticalDivider = require('./view/VerticalDivider')
var HorizontalDivider = require('./view/HorizontalDivider')
var FrameEditorControls = require('./view/FrameEditorControls')

require('normalize.css')
require('./actions')
require('./update-checker')

var render = function (state) {
  var n_frames = getNFramesForProject(state.current_project)
  var timeline_h = getTimelineHeight(state)
  if (n_frames === 1) {
    return AbsoluteLayout(h, [
      [Modals(state), 0],
      [Menu(state), S.sizes.menu_height],
      [AbsoluteLayout(h, [
        [AbsoluteLayout(h, [
          [EffectPanel(state)],
          [HorizontalDivider(), S.sizes.divider],
          [MainSourceBar(state), S.sizes.mainsource_bar_height],
          [HorizontalDivider(), S.sizes.divider],
          [Timeline(state), timeline_h]
        ]), S.sizes.left_panels],
        [VerticalDivider(), S.sizes.divider],
        [FrameEditor(state)],
        [VerticalDivider(), S.sizes.divider],
        [FrameEditorControls(state), S.sizes.FrameEditorControls_width],
        [Debug(state), S.sizes.Debug_width]
      ], true)]
    ])
  }
  return AbsoluteLayout(h, [
    [Modals(state), 0],
    [Menu(state), S.sizes.menu_height],
    [AbsoluteLayout(h, [
      [EffectPanel(state), S.sizes.left_panels],
      [VerticalDivider(), S.sizes.divider],
      [FrameEditor(state)],
      [VerticalDivider(), S.sizes.divider],
      [FrameEditorControls(state), S.sizes.FrameEditorControls_width],
      [Debug(state), S.sizes.Debug_width]
    ], true)],
    [HorizontalDivider(), S.sizes.divider],
    [MainSourceBar(state), S.sizes.mainsource_bar_height],
    [HorizontalDivider(), S.sizes.divider],
    [Timeline(state), timeline_h]
  ])
}

vdomHB.update({// initial_state

  frame: 0,
  currentTime: 0,
  open_layer_id: undefined,
  preview_mode: false,
  currently_open_menu: undefined,

  window_w: window.innerWidth,
  window_h: window.innerHeight,

  error_message_q: [],
  waiting_progress_bars: {
    INITIAL_LOAD: { text: 'loading...' }
  }
})
document.body.appendChild(vdomHB.init(render))
window.addEventListener('resize', _.throttle(function () {
  // even if this is not used, we want to re-render on resizes
  vdomHB.update({
    window_w: window.innerWidth,
    window_h: window.innerHeight
  })
}, 100))
document.body.addEventListener('contextmenu', function (e) {
  e.preventDefault()
}, true)
vdomHB.delegator.listenTo('keydown')
vdomHB.delegator.listenTo('keyup')
vdomHB.delegator.listenTo('mousedown')
vdomHB.delegator.addGlobalEventListener('keydown', function (ev) {
  switch (ev.keyCode) {
    case 17:
      bus.emit('set-showMagnifier', true)
      break
    case 38:
      if (ev.ctrlKey) {
        bus.emit('shift-current-point', 'up')
      }
      break
    case 39:
      if (ev.ctrlKey) {
        bus.emit('shift-current-point', 'right')
      } else {
        bus.emit('seek-inc-by', +1)
      }
      break
    case 40:
      if (ev.ctrlKey) {
        bus.emit('shift-current-point', 'down')
      }
      break
    case 37:
      if (ev.ctrlKey) {
        bus.emit('shift-current-point', 'left')
      } else {
        bus.emit('seek-inc-by', -1)
      }
      break
  }
})
vdomHB.delegator.addGlobalEventListener('keyup', function (ev) {
  switch (ev.keyCode) {
    case 17:
      bus.emit('set-showMagnifier', false)
      break
  }
})
vdomHB.delegator.addGlobalEventListener('mousedown', function (ev) {
  var state = vdomHB.readState()
  if (state.showMagnifier) {
    bus.emit('set-showMagnifier', false)
  }
})
