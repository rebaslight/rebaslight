var fs = require('fs')
var path = require('path')
var electron = require('electron')

var app = electron.app
var ipcMain = electron.ipcMain

var rl_home = path.join(app.getPath('home'), '.rebaslight')
var projects3_json = path.join(rl_home, 'projects3.json')

var save = function (data, callback) {
  var json = JSON.stringify(data)
  fs.writeFile(projects3_json, json, function (err) {
    if (err && err.code === 'ENOENT') {
      fs.mkdir(rl_home, function (err) {
        if (err) return callback(err)
        fs.writeFile(projects3_json, json, callback)
      })
    } else {
      callback(err)
    }
  })
}

var read = function (callback) {
  fs.readFile(projects3_json, 'utf8', function (err, data) {
    if (err) {
      if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
        callback(null, {})
      } else {
        callback(err)
      }
      return
    }
    var text = data.toString()
    var json = {}
    try {
      json = JSON.parse(text)
    } catch (e) {
      json = {}
    }
    callback(null, json)
  })
}

var defRPC = function (name, fn) {
  ipcMain.on(name, function (event, callid, data) {
    fn(data, function (err, data) {
      if (err) {
        event.sender.send(name + '-error', callid, err)
      } else {
        event.sender.send(name + '-data', callid, data)
      }
    })
  })
}

defRPC('rlhome-projects-read', function (data, callback) {
  read(callback)
})

defRPC('rlhome-projects-save', function (data, callback) {
  save(data, callback)
})
