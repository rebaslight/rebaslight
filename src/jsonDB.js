var _ = require('lodash')
var bus = require('./event-bus')
var RLBrowser = require('./RLBrowser')

var jsonIO = (function () {
  if (RLBrowser) {
    return RLBrowser.projects
  } else {
    return {
      write: function (data, callback) {
        try {
          window.localStorage.setItem('projects3_json', JSON.stringify(data))
        } catch (e) {
          // too bad, so sad
        }
        callback()
      },
      load: function (callback) {
        var contents
        try {
          contents = window.localStorage.getItem('projects3_json')
        } catch (e) {
          // too bad, so sad
        }
        callback(null, _.isString(contents) ? JSON.parse(contents) : {})
      }
    }
  }
}())

var db = {}

module.exports = {
  save: function (new_db) {
    db = new_db
    bus.emit('global_settings', db.global_settings || {})
    bus.emit('projects', db.projects || {})
    if (!_.has(db['projects'], db.current_project_id)) {
      db.current_project_id = null
      bus.emit('set-current_project', null)
    } else {
      bus.emit('set-current_project', db['projects'][db.current_project_id])
    }
    bus.emit('set-unlocked', db.unlocked)
    // TODO throttle writes
    jsonIO.write(db, function (err) {
      if (err) {
        bus.emit('display-error', 'Failed to save project', err)
      }
    })
  },
  read: function () {
    return _.cloneDeep(db)
  },
  load: jsonIO.load
}
