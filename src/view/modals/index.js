var _ = require('lodash')
var h = require('virtual-dom/h')
var S = require('../styles')
var bus = require('../../event-bus')
var Modal = require('./Modal')
var css_vars = require('../common_css')
var prevDflt = require('wrap-prevent-default')
var Progress = require('./Progress')
var OpenProject = require('./OpenProject')
var OpenMainSource = require('./OpenMainSource')
var AboutModal = require('./AboutModal')
var ExportModal = require('./ExportModal')
var UnlockModal = require('./UnlockModal')
var VideoPlayer = require('./VideoPlayer')
var ConvertModal = require('./ConvertModal')
var GenericModal = require('./GenericModal')
var ExportFinished = require('./ExportFinished')
var DownloadExported = require('./DownloadExported')

var GlassBackdrop = function () {
  return h('div', {
    style: S.xstyle.noselect({
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: S.z_indexes.modals - 10,

      background: S.color.main_bg,
      opacity: 0.7
    })
  })
}

var ErrorModal = function (msg) {
  // TODO display the msg.error
  return Modal({
    title: 'Error!',
    onClose: bus.signal('pop-error_message_q')
  }, h('div', [
    h('div', {style: {whiteSpace: 'pre-line'}}, msg.context_msg),
    msg.clipboard_text
      ? h('div', {style: {marginTop: '1em'}}, [
        h('div', 'Here is the complete output. You can copy it and send it to support@rebaslight.com for help.'),
        h('textarea', {
          readOnly: 'readonly',
          rows: 3,
          style: {width: '98%'},
          'ev-click': prevDflt(function (ev) {
            ev.target.focus()
            ev.target.select()
          })
        }, msg.clipboard_text),
        h('a.' + css_vars.link, {
          href: '#',
          'ev-click': prevDflt(function (ev) {
            var div = ev.target.parentElement
            var ta = div.getElementsByTagName('TEXTAREA')[0]
            ta.focus()
            ta.select()
            document.execCommand('copy')
            var span = document.createElement('B')
            span.innerHTML = 'copied!'
            span.style.color = '#48de48'
            span.style.marginLeft = '1em'
            div.appendChild(span)
          })
        }, ['copy to clipboard'])
      ])
      : null
  ]))
}

var renderModal = function (state) {
  if (_.size(state.error_message_q) > 0) {
    return ErrorModal(_.head(state.error_message_q))
  }
  if (_.size(state.generic_modal_q) > 0) {
    return GenericModal(_.head(state.generic_modal_q))
  }
  if (_.size(state.waiting_progress_bars) > 0) {
    return Progress({
      bars: state.waiting_progress_bars,
      window_h: state.window_h
    })
  }
  if (state.show_OpenMainSource || (_.size(state.projects) === 0)) {
    return OpenMainSource(state)
  }
  if (!state.current_project) {
    return OpenProject(state)
  }
  if (state.UnlockModal) {
    return UnlockModal(state)
  }
  if (state.show_ExportModal) {
    return ExportModal(state)
  }
  if (state.exported_image_download_url) {
    return DownloadExported(state)
  }
  if (state.show_AboutModal) {
    return AboutModal({
      onClose: bus.signal('hide-about-modal')
    })
  }
  if (state.video_player_modal &&
      state.video_player_modal.file_path) {
    return VideoPlayer(state)
  }
  if (state.export_finished_modal &&
      state.export_finished_modal.file_path) {
    return ExportFinished(state)
  }
  if (state.ConvertModal) {
    return ConvertModal(state)
  }
  return null
}

module.exports = function (state) {
  var modal = renderModal(state)
  if (!modal) {
    return h('span')
  }
  return h('div', {
  }, [
    h('div', {
      style: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        zIndex: S.z_indexes.modals
      }
    }, modal),
    GlassBackdrop()
  ])
}
