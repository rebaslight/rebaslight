var bus = require('./event-bus')
var URL = window.URL || window.webkitURL
var atob = window.atob
var Blob = window.Blob
var Uint8Array = window.Uint8Array

if (!URL || !URL.createObjectURL || !atob || !Blob || !Uint8Array) {
  module.exports = function (canvas) {
    bus.emit('show-bad-browser-message')
    return undefined
  }
} else {
  var dataURItoBlob = function (base64_data_url) {
    var byte_string = atob(base64_data_url.split(',')[1])

    var charcode_array = new Uint8Array(byte_string.length)
    var i
    for (i = 0; i < byte_string.length; i += 1) {
      charcode_array[i] = byte_string.charCodeAt(i)
    }

    var mime_type = base64_data_url.split(',')[0].split(':')[1].split(';')[0]

    return new Blob([charcode_array], {
      type: mime_type
    })
  }

  module.exports = function (canvas) {
    var data_url = canvas.toDataURL('image/png')

    var blob = dataURItoBlob(data_url)

    if (!URL || !URL.createObjectURL) {
      bus.emit('show-bad-browser-message')
      return
    }
    var blob_url = URL.createObjectURL(blob)

    return blob_url
  }
}
