var h = require('virtual-dom/h')
var bus = require('../../event-bus')
var path = require('path')
var Modal = require('./Modal')
var Button = require('../Button')
var Fact_orig = require('../Fact')

var Fact = function (key, value) {
  return Fact_orig(key, value, {
    width: '120px'
  })
}

var onClose = bus.signal('close-ConvertModal')

var FilePath = function (file) {
  if (!file) {
    return
  }
  return h('span', {title: file}, path.basename(file))
}

module.exports = function (state) {
  var opts = state.ConvertModal || {}

  var input_file = opts.input_file
  var output_file = path.join(
    path.dirname(input_file),
    path.basename(input_file, path.extname(input_file))
  ) + '-RLconvert.webm'

  return Modal({
    title: 'Convert',
    onClose: onClose,
    buttons: [
      Button({
        'ev-click': function () {
          bus.emit('start-Convert', {
            input_file: input_file,
            input_n_frames: opts.input_n_frames,
            output_file: output_file
          })
        }
      }, 'Convert')
    ]
  }, [
    Fact('Input File', FilePath(input_file)),
    Fact('Output File', FilePath(output_file)),
    Fact('Container', '.webm'),
    Fact('Video Codec', 'VP8'),
    Fact('Audio Codec', 'vorbis')
  ])
}
