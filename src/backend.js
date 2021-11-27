var contra = require('contra')
var _ = require('lodash')
var bus = require('./event-bus')
var cuid = require('cuid')
var jsonDB = require('./jsonDB')
var fileDB = require('./fileDB')
var Effects = require('./effects')
var getNextNameInSequence = require('./getNextNameInSequence')

module.exports = {
  init: function () {
    jsonDB.load(function (err, json) {
      if (err) {
        bus.emit('display-error', 'Failed to load projects', err)
        return
      }
      contra.map(_.isPlainObject(json && json.projects) ? json.projects : {}, function (project, next) {
        if (project && project.main_source && project.main_source.fileDB_id) {
          fileDB.getURL(project.main_source.fileDB_id, next)
        } else {
          next()
        }
      }, function (err, data) {
        if (err) {
          // ignore it b/c we can just have them load the file again manually
        }
        _.forEach(data, function (url, project_id) {
          if (_.isString(url)) {
            if (_.has(json, ['projects', project_id, 'main_source', 'fileDB_id'])) {
              json.projects[project_id].main_source.url = url
            }
          }
        })
        if (_.has(json, 'auth')) {
          // if they purchased an effect in the past, then unlock
          if (true &&
              _.isEqual(_.keys(json.auth).sort(), ['email', 'timestamp', 'token']) &&
              _.isString(json.auth.email) &&
              _.isNumber(json.auth.timestamp) &&
              _.isString(json.auth.token)) {
            if (_.find(json.projects, function (p) {
              return _.find(p.layers, function (l) {
                return _.includes([
                  'muzzle-flash',
                  'lightning'
                ], l.effect_id)
              })
            })) {
              json.unlocked = 'Effect purchased by: ' +
                json.auth.email +
                ' | last sign-in: ' +
                (new Date(json.auth.timestamp * 1000)).toISOString()
            }
          }
          delete json.auth
        }
        if (_.has(json, 'unlocked') && (!_.isString(json.unlocked) || json.unlocked.trim().length === 0)) {
          delete json.unlocked
        }
        jsonDB.save(json)// this updates in-memory state as well
        bus.emit('initial-load-done')
      })
    })
  },
  openProject: function (id) {
    var db = jsonDB.read()
    db.current_project_id = id
    jsonDB.save(db)
  },
  setMainSource: function (project_id, file_info) {
    var db = jsonDB.read()
    if (!_.has(db, ['projects', project_id])) {
      project_id = cuid()
      if (!_.has(db, 'projects')) {
        db['projects'] = {}
      }
      db['projects'][project_id] = {
        id: project_id
      }
      db.current_project_id = project_id
    }
    db['projects'][project_id]['name'] = file_info.name
    db['projects'][project_id]['main_source'] = file_info
    jsonDB.save(db)
  },
  setMainSourceInfo: function (project_id, info) {
    var db = jsonDB.read()
    if (!_.has(db, ['projects', project_id, 'main_source', 'url'])) {
      return
    }
    db['projects'][project_id]['main_source'] = _.assign(
      {},
      db['projects'][project_id]['main_source'],
      _.omit(info, 'url', 'type', 'file_path')// can't override some things
    )
    jsonDB.save(db)
  },
  addLayer: function (project_id, effect_id) {
    var db = jsonDB.read()
    if (!_.has(db, ['projects', project_id])) {
      return
    }
    if (!_.has(Effects, effect_id)) {
      return
    }
    var effect_name = Effects[effect_id].human_name
    if (!_.has(db.projects[project_id], 'layers')) {
      db.projects[project_id]['layers'] = {}
    }
    var layer_id = cuid()
    db.projects[project_id]['layers'][layer_id] = {
      id: layer_id,
      name: getNextNameInSequence([effect_name + ' 0'].concat(_.map(db.projects[project_id]['layers'], 'name')), effect_name),
      effect_id: effect_id,
      settings: {},
      keyframe_points: {}// {frame#: [x,y, x,y, ...]}
    }
    jsonDB.save(db)
    return layer_id
  },
  changeFrameRate: function (project_id, oldFps, newFps, table) {
    const db = jsonDB.read()
    const project = db.projects[project_id]
    if (!project) {
      return
    }
    // keyframe_points
    for (const layer of Object.values(project.layers || {})) {
      const oldFrames = layer.keyframe_points
      const newFrames = {}
      for (let oldFrameI of Object.keys(oldFrames || {})) {
        oldFrameI = parseInt(oldFrameI, 10)
        const time = oldFrameI / oldFps

        let tableTime = 0
        for (const tt of table) {
          if (tt > time) {
            break
          }
          tableTime = tt
        }

        let guessNewI = Math.floor(time * newFps) - 1
        while (guessNewI / newFps < tableTime) {
          guessNewI++
        }

        newFrames[guessNewI] = oldFrames[oldFrameI]
      }
      layer.keyframe_points = newFrames
    }
    project.main_source.use_fps = newFps
    jsonDB.save(db)
  },
  savePoints: function (project_id, layer_id, frame_n, points) {
    var db = jsonDB.read()
    if (!_.has(db, ['projects', project_id, 'layers', layer_id])) {
      return
    }
    if (!_.has(db.projects[project_id]['layers'][layer_id], 'keyframe_points')) {
      db.projects[project_id]['layers'][layer_id]['keyframe_points'] = {}
    }
    db.projects[project_id]['layers'][layer_id]['keyframe_points'][frame_n] = points
    jsonDB.save(db)
  },
  removeKeyframe: function (project_id, layer_id, frame_n) {
    var db = jsonDB.read()
    if (!_.has(db, ['projects', project_id, 'layers', layer_id, 'keyframe_points', frame_n])) {
      return
    }
    delete db.projects[project_id].layers[layer_id].keyframe_points[frame_n]
    jsonDB.save(db)
  },
  saveLayerSettings: function (project_id, layer_id, settings) {
    var db = jsonDB.read()
    if (!_.has(db, ['projects', project_id, 'layers', layer_id])) {
      return
    }
    var layer = db.projects[project_id]['layers'][layer_id] || {}
    if (!_.has(Effects, layer['effect_id'])) {
      return
    }
    var effect = Effects[layer['effect_id']]

    var old_settings = effect.normalizeSettings(layer.settings)
    var new_settings = effect.normalizeSettings(_.assign({}, old_settings, settings))

    db.projects[project_id]['layers'][layer_id]['settings'] = new_settings
    jsonDB.save(db)
  },
  saveGlobalSettings: function (global_settings) {
    var db = jsonDB.read()
    db.global_settings = global_settings
    jsonDB.save(db)
  },
  deleteLayer: function (project_id, layer_id) {
    var db = jsonDB.read()
    if (!_.has(db, ['projects', project_id, 'layers', layer_id])) {
      return
    }
    delete db.projects[project_id]['layers'][layer_id]
    jsonDB.save(db)
  },
  deleteProject: function (project_id) {
    var db = jsonDB.read()
    if (!_.has(db, ['projects', project_id])) {
      return
    }
    delete db.projects[project_id]
    jsonDB.save(db)
  },
  signToUnlock: function (signature) {
    if (!_.isString(signature)) {
      return
    }
    var db = jsonDB.read()
    db.unlocked = signature
    jsonDB.save(db)
  },
  removeUnlocked: function () {
    var db = jsonDB.read()
    if (!_.has(db, 'unlocked')) {
      return
    }
    delete db.unlocked
    jsonDB.save(db)
  }
}
