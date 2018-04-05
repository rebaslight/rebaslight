var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('../styles')
var bus = require('../../event-bus')
var Modal = require('./Modal')
var jsCSS = require('js-managed-css')
var fileDB = require('../../fileDB')

var css_vars = jsCSS({
  '.$drop_zone': {
    'cursor': 'pointer',
    'border': '2px dashed ' + S.color.border_highlight,
    'border-radius': '20px',
    'padding': '1.5em',
    'text-align': 'center',
    ':hover': {
      'border-style': 'solid'
    },
    'position': 'relative',
    'input': {
      'cursor': 'pointer',
      'opacity': 0,
      'position': 'absolute',
      'top': 0,
      'right': 0,
      'width': '100%', // hack
      'bottom': 0,
      'left': 0
    },
    'p': {
      'margin': '0 0 1em 0'
    }
  }
})

var onFileChange = function (e) {
  var files = e && e.target && e.target.files
  if (!files) {
    bus.emit('show-bad-browser-message')
    return
  }
  if (files.length === 0) {
    bus.emit('display-error', 'Please select a file to edit')
    return
  }
  if ((files.length > 1) || (!files[0])) {
    bus.emit('display-error', 'Opps, you can only open one file at a time')
    return
  }
  var file = files[0]
  var file_info = {
    type: /^image/i.test(file.type) ? 'image' : 'video',
    name: file.name
  }
  if (file.path) {
    file_info.file_path = file.path
    file_info.url = 'file://' + file.path
    bus.emit('set-main-source', file_info)
  } else {
    if (file_info.type === 'video') {
      bus.emit('display-error', 'Opening video files is only available in the downloadable version.\n\nTry editing a picture file instead.')
      return
    }
    bus.emit('main-source-start-loading', file_info.type)
    fileDB.storeFile(file, function (err, blah) {
      if (err) {
        return bus.emit('display-error', 'Trouble loading file', err)
      }

      file_info.url = blah.url
      file_info.fileDB_id = blah.id

      bus.emit('set-main-source', file_info)
      bus.emit('main-source-done-loading')
    })
  }
}

module.exports = function (state) {
  return Modal({
    title: 'Open Main Source',
    buttons: [], // no buttons on the bottom
    onClose: state.show_OpenMainSource && (_.size(state.projects) > 0) ? bus.signal('hide_OpenMainSource') : null
  }, h('div', [
    h('div.' + css_vars.drop_zone, [
      h('p', 'Drop your file here'),
      h('p', '- or -'),
      h('div', 'Click to select a file'),
      h('input', {
        type: 'file',
        accept: 'video/*,image/*,.mov',
        'ev-change': onFileChange
      })
    ])
  ]))
}
