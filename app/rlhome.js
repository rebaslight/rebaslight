var fs = require('fs')
var URL = require('url').URL
var path = require('path')
var electron = require('electron')

var app = electron.app
var ipcMain = electron.ipcMain

var rlHome = path.join(app.getPath('home'), '.rebaslight')
var projectsJsonFile = path.join(rlHome, 'projects3.json')

var save = function (data, callback) {
  var json = JSON.stringify(data)
  fs.writeFile(projectsJsonFile, json, function (err) {
    if (err && err.code === 'ENOENT') {
      fs.mkdir(rlHome, function (err) {
        if (err) return callback(err)
        fs.writeFile(projectsJsonFile, json, callback)
      })
    } else {
      callback(err)
    }
  })
}

var read = function (callback) {
  fs.readFile(projectsJsonFile, 'utf8', function (err, data) {
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

defRPC('rlhome-show-save-dialog', function (data, callback) {
  electron.dialog.showSaveDialog(data)
    .then(resp => callback(null, resp.filePath))
    .catch(err => callback(err))
})

defRPC('rlhome-inputFileURLExists', function (fileUrl, callback) {
  fs.access(new URL(fileUrl), fs.constants.R_OK, callback)
})

defRPC('rlhome-doesFileExist', function (filePath, callback) {
  fs.open(filePath, 'wx', function (err, fd) {
    if (err) {
      if (err.code === 'EEXIST') {
        callback(null, true)
        return
      }
      callback(err)
      return
    }
    fs.close(fd, callback)
  })
})

ipcMain.on('rlhome-quit', function () {
  electron.app.quit()
})
