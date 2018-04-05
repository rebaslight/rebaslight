var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('./styles')
var bus = require('../event-bus')
var Slider = require('./inputs/Slider')
var Button = require('./Button')
var AbsoluteLayout = require('virtual-dom-absolute-layout')
var getNFramesForProject = require('../getNFramesForProject')

var onSliderSeek = function (frame) {
  bus.emit('seek-to', frame)
}

module.exports = function (state) {
  var frame = state.frame
  var n_frames = getNFramesForProject(state.current_project)

  if (n_frames === 1) {
    return AbsoluteLayout(h, [
      [h('div', {
        style: S.xstyle.absolute({
          color: S.color.text,
          background: S.color.main_bg
        })
      }, [
        Button({'ev-click': bus.signal('select-layer')}, 'Main Source')
      ]), 140],
      [h('div', {style: S.xstyle.absolute({
        lineHeight: S.sizes.mainsource_bar_height + 'px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        color: S.color.text,
        background: S.color.main_bg
      })}, [_.isString(state.current_project && state.current_project.name) ? state.current_project.name : ''])]
    ], true)
  }

  return AbsoluteLayout(h, [
    [h('div', {
      style: S.xstyle.absolute({
        color: S.color.text,
        background: S.color.main_bg
      })
    }, [
      Button({'ev-click': bus.signal('select-layer')}, 'Main Source')
    ]), 140],
    [h('div', {
      style: S.xstyle.absolute({
        color: S.color.text,
        background: S.color.main_bg
      })
    }, [
      Slider({
        slot: frame,
        slots: n_frames,
        onChange: onSliderSeek,
        area_height: S.sizes.mainsource_bar_height
      })
    ])],
    [h('div', {style: S.xstyle.absolute({
      lineHeight: S.sizes.mainsource_bar_height + 'px',
      textAlign: 'center',
      color: S.color.text,
      background: S.color.main_bg
    })}, [frame + ' / ' + n_frames]), 140]
  ], true)
}
