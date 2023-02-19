var electron = require('electron')
var ipcRenderer = electron.ipcRenderer

var nextCallID = (function () {
  var i = 0
  return function () {
    i++
    return 'call-' + i
  }
}())

var defRPC = function (name) {
  const callbacks = new Map()
  ipcRenderer.on(name + '-error', function (event, callid, err) {
    const cb = callbacks.get(callid)
    if (cb) {
      cb(err)
    }
    callbacks.delete(callid)
  })
  ipcRenderer.on(name + '-data', function (event, callid, data) {
    const cb = callbacks.get(callid)
    if (cb) {
      cb(undefined, data)
    }
    callbacks.delete(callid)
  })
  return function (data, callback) {
    var callid = nextCallID()
    callbacks.set(callid, callback)
    ipcRenderer.send(name, callid, data)
  }
}

var rpcSave = defRPC('rlhome-projects-save')
var rpcRead = defRPC('rlhome-projects-read')
var rpcInputFileURLExists = defRPC('rlhome-inputFileURLExists')
var rpcDoesFileExist = defRPC('rlhome-doesFileExist')

var rpcShowSaveDialog = defRPC('rlhome-show-save-dialog')

window.REBASLIGHT_BROWSER = {
  quit: function () {
    ipcRenderer.send('rlhome-quit')
  },
  showSaveDialog: function (opts, callback) {
    var getStrOpt = function (key, dflt) {
      if (opts && Object.prototype.hasOwnProperty.call(opts, key) && (typeof opts[key] === 'string')) {
        return opts[key]
      }
      return dflt
    }
    rpcShowSaveDialog({
      title: getStrOpt('title', 'Save'),
      defaultPath: getStrOpt('defaultPath'),
      filters: [
        {name: 'Video', extensions: ['mp4']}
      ]
    }, callback)
  },
  projects: {
    write: function (data, callback) {
      rpcSave(data, callback)
    },
    load: function (callback) {
      rpcRead(null, callback)
    }
  },
  inputFileURLExists: function (fileUrl, callback) {
    rpcInputFileURLExists(fileUrl, callback)
  },
  doesFileExist: function (filePath, callback) {
    rpcDoesFileExist(filePath, callback)
  },
  Exporter: function (opts) {
    ipcRenderer.on('ffmpeg-stopped', function (event, code) {
      opts.onStopped(code)
    })
    ipcRenderer.on('ffmpeg-error', function (event, error) {
      opts.onError(error)
    })
    ipcRenderer.on('ffmpeg-status', function (event, line) {
      opts.onStatus(line)
    })
    return {
      start: function (arg) {
        ipcRenderer.send('ffmpeg-start', arg)
      },
      render: function (base64Str) {
        ipcRenderer.send('ffmpeg-render-frame', base64Str)
      },
      stop: function () {
        ipcRenderer.send('ffmpeg-stop')
      }
    }
  },
  Converter: function (opts) {
    ipcRenderer.on('ffmpeg-convert-stopped', function (event, code) {
      opts.onStopped(code)
    })
    ipcRenderer.on('ffmpeg-convert-error', function (event, error) {
      opts.onError(error)
    })
    ipcRenderer.on('ffmpeg-convert-status', function (event, line) {
      opts.onStatus(line)
    })
    return {
      start: function (opts) {
        ipcRenderer.send('ffmpeg-convert', opts)
      }
    }
  },
  getFrameTable: function (input_file) {
    return new Promise(function (resolve, reject) {
      ipcRenderer.on('ffmpeg-frame-table-error', function (event, error) {
        reject(error)
      })
      ipcRenderer.on('ffmpeg-frame-table-done', function (event, table) {
        resolve(table)
      })
      ipcRenderer.send('ffmpeg-frame-table', {
        input_file
      })
    })
  }
}
