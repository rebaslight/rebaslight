var _ = require('lodash')
var h = require('virtual-dom/h')
var bus = require('../../event-bus')
var path = require('path')
var Fact = require('../Fact')
var Button = require('../Button')
var FileTypeIcon = require('../FileTypeIcon')

module.exports = function (main_source) {
  var ext = ''
  if (_.isString(main_source.file_path)) {
    ext = path.extname(main_source.file_path).toLowerCase()
  }

  var convert_btn
  if ((main_source.type === 'video') &&
      _.isString(main_source.file_path) &&
      !/webm/i.test(ext)
  ) {
    convert_btn = Button({ 'ev-click': bus.signal('open-ConvertModal', {
      input_file: main_source.file_path,
      input_n_frames: main_source.n_frames
    }) }, [
      'Convert to webm'
    ])
  }

  return h('div', [
    h('h3', { 'ev-click': bus.signal('change-main-source') }, [
      FileTypeIcon(main_source.type),
      ' ',
      main_source.name
    ]),

    Fact('Size', main_source.frame_w + ' x ' + main_source.frame_h),

    main_source.n_frames > 1
      ? Fact('# Frames', main_source.n_frames)
      : null,

    main_source.use_fps
      ? Fact('Rate', h('span', { title: main_source.use_fps + ' fps' }, Math.ceil(main_source.use_fps) + ' fps'))
      : main_source.detected_fps && main_source.detected_fps !== 25
        ? h('div', { style: {
          marginBottom: '1em',
          textAlign: 'center'
        } }, [
          Button({
            'ev-click': bus.signal('main-source-use-detected_fps', false)
          }, 'Restore original frame rate')
        ])
        : null,

    Fact('Rotate', [
      Button({ 'ev-click': bus.signal('rotate-main-source', false) }, h('i.fa.fa-rotate-left')),
      Button({ 'ev-click': bus.signal('rotate-main-source', true) }, h('i.fa.fa-rotate-right'))
    ]),

    Fact('Format', [
      h('div', [
        ext
      ]),
      convert_btn
    ])
  ])
}
