var cuid = require('cuid')

var URL = window.URL || window.webkitURL
var Blob = window.Blob
var FileReader = window.FileReader
var is_outdated_browser = !URL || !URL.createObjectURL || !Blob || !FileReader

var db = require('levelup')(require('level-js')('fileDB'), {
  keyEncoding: 'utf8',
  valueEncoding: 'binary'
})

var fileToBuffer = function (file, callback) {
  var reader = new FileReader()
  var had_error = false
  reader.onerror = function (err) {
    had_error = true
    callback(err)
  }
  reader.onloadend = function () {
    if (!had_error) {
      callback(null, reader.result)
    }
  }
  reader.readAsArrayBuffer(file)
}

module.exports = {
  storeFile: function (file, callback) {
    if (is_outdated_browser) return callback(new Error('OUTDATED_BROWSER'))

    fileToBuffer(file, function (err, buffer) {
      if (err) return callback(err)
      var id = cuid()
      db.put(id, buffer, function (err) {
        if (err) return callback(err)
        callback(null, {
          id: id,
          url: URL.createObjectURL(file)
        })
      })
    })
  },
  getURL: function (id, callback) {
    if (is_outdated_browser) return callback(new Error('OUTDATED_BROWSER'))

    db.get(id, function (err, data) {
      if (err) return callback(err)

      var blob = new Blob([data], {type: 'application/octet-binary'})
      var url = URL.createObjectURL(blob)
      callback(null, url)
    })
  },
  del: function (id, callback) {
    if (is_outdated_browser) return callback(new Error('OUTDATED_BROWSER'))

    db.del(id, callback)
  },
  getKeys: function (callback) {
    if (is_outdated_browser) return callback(new Error('OUTDATED_BROWSER'))

    var s = db.createKeyStream()
    var keys = []
    s.on('error', function (err) {
      callback(err)
    })
    s.on('data', function (key) {
      keys.push(key)
    })
    s.on('end', function () {
      callback(null, keys)
    })
  }
}
