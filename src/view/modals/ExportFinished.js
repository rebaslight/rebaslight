var _ = require('lodash')
var h = require('virtual-dom/h')
var bus = require('../../event-bus')
var Modal = require('./Modal')
var Button = require('../Button')
var ffmpeg_presets = require('../../ffmpeg-presets')

var onClose = bus.signal('close-export_finished_modal')

module.exports = function (state) {
  var file_path = state.export_finished_modal.file_path

  var can_play_now = _.get(ffmpeg_presets, [
    _.get(state, 'current_project.main_source.ffmpeg_preset', _.head(_.keys(ffmpeg_presets))),
    'can_play_in_app'
  ], false)

  var buttons = []

  if (can_play_now) {
    buttons.push(Button({
      'ev-click': bus.signal('open-video_player_modal', file_path)
    }, 'Play'))
  } else {
    buttons.push(Button({
      'ev-click': onClose
    }, 'Ok'))
  }

  return Modal({
    title: 'Export finished!',
    onClose: onClose,
    buttons: buttons
  }, [
    h('p', 'Your new video is saved here:'),
    h('p', file_path),
    can_play_now
      ? h('p', 'Would you like to watch it now?')
      : null
  ])
}
