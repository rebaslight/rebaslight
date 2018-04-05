var _ = require('lodash')
var h = require('virtual-dom/h')
var mkGradientEZ = require('./utils/mkGradientEZ')
var createElement = require('virtual-dom/create-element')
var applyGradient = require('./utils/applyGradient')
var normalizeSettingsBasedOnUISchema = require('./utils/normalizeSettingsBasedOnUISchema')

var textures = [
  createElement(h('img', {src: require('../img/textures/smoke1.png')})),
  createElement(h('img', {src: require('../img/textures/smoke2.png')}))
  // createElement(h('img', {src: require('../img/textures/test.jpg')}))
]

var drawGradientImage = function (ctx, fromX, fromY, destX, destY, pos, frameW, jitter) {
  var imgX = fromX + pos
  var dx = Math.abs(destX - fromX)
  var dy = (destY - fromY)
  var m = dy / dx
  var b = fromY - (m * fromX)
  var imgY = m * imgX + b
  var h = 0
  if (destY < fromY) { // Moving up
    h = 2 * (fromY - imgY)
  } else { // Moving down
    h = 2 * (destY - imgY)
  }
  var jitterInt = jitter * 100
  var randomness = _.random(-jitterInt, jitterInt) / 100
  var imgW = h * frameW

  var texture = _.sample(textures)
  ctx.drawImage(texture, imgX, imgY + (h * randomness), imgW, h)
}

var drawEjection = function (ctx, coreX, coreY, theta, height, length, mid_percent, frameW, jitter) {
  var midPos = (length * mid_percent)
  var upDist = midPos
  var fallDist = length - midPos
  var nUpImgs = upDist
  var nFallImgs = fallDist

  var endX = coreX + upDist + fallDist
  var endY = coreY
  var midX = coreX + upDist
  var midY = coreY - height

  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.translate(coreX, coreY)
  ctx.rotate(theta)
  ctx.translate(-coreX, -coreY)
  var i, frameX
  for (i = 0; i < nUpImgs; i += 1) {
    frameX = ((upDist / nUpImgs) * i)
    drawGradientImage(ctx, coreX, coreY, midX, midY, frameX, frameW, jitter)
  }
  for (i = 0; i < nFallImgs; i += 1) {
    frameX = ((fallDist / nFallImgs) * i)
    drawGradientImage(ctx, midX, midY, endX, endY, frameX, frameW, jitter)
  }
  ctx.restore()
}

var presets = {
  'hand-gun': {
    name: 'Hand Gun',
    settings: {
      n_side_e: 0,
      jitter: 20,
      mid_point: 30,
      core_width: 40,
      gradient: ['custom', 128, 245, 135, 62, 10]
    }
  },
  'machine-gun': {
    name: 'Machine Gun',
    settings: {
      n_side_e: 2,
      jitter: 30,
      mid_point: 20,
      core_width: 50,
      gradient: ['custom', 128, 245, 135, 62, 10]
    }
  },
  'shotgun': {
    name: 'Shotgun',
    settings: {
      n_side_e: 0,
      jitter: 60,
      mid_point: 20,
      core_width: 50,
      gradient: ['custom', 128, 245, 135, 62, 10]
    }
  },
  'laser-blaster': {
    name: 'Laser Blaster',
    settings: {
      n_side_e: 0,
      jitter: 0,
      mid_point: 15,
      core_width: 24,
      gradient: ['custom', 128, 76, 162, 231, 10]
    }
  },
  'custom': {
    name: 'Custom'
  }
}

var ui_schema = {
  preset: {
    'label': 'Preset',
    'type': 'select',
    'default': _.head(_.keys(presets)),
    'options': _.map(presets, function (p, key) {
      return [key, p.name]
    })
  },
  n_side_e: {
    'label': 'Number of Side Ejections',
    'type': 'slider',
    'default': 2,
    'slots': 5
  },
  jitter: {
    'label': 'Jitter',
    'type': 'slider',
    'default': 11,
    'slots': 100
  },
  mid_point: {
    'label': 'Mid Point',
    'type': 'slider',
    'default': 30,
    'slots': 100
  },
  core_width: {
    'label': 'Core Width',
    'type': 'slider',
    'default': 40,
    'slots': 100
  },
  gradient: {
    'label': 'Color Gradient',
    'type': 'gradient',
    'default': ['yellow', 128, 245, 135, 62, 10]
  }
}

module.exports = {
  human_name: 'Muzzle Flash',
  min_n_points: 2,
  max_n_points: 2,
  normalizeSettings: function (settings_orig) {
    if (settings_orig.preset !== 'custom') {
      var preset = _.has(presets, settings_orig.preset)
        ? settings_orig.preset
        : _.first(_.keys(presets))
      return _.assign({}, presets[preset].settings, {preset: preset})
    }
    return normalizeSettingsBasedOnUISchema(ui_schema, settings_orig)
  },
  settingsUI: function (settings) {
    if (settings.preset !== 'custom') {
      return {preset: ui_schema.preset}
    }
    return ui_schema
  },
  getOutlinePoints: function (points, settings) {
    if (_.size(points) < 4) {
      return []
    }
    var coreX = points[0]
    var coreY = points[1]
    var endX = points[2]
    var endY = points[3]

    var dx = coreX - endX
    var dy = coreY - endY
    var length = Math.sqrt(dx * dx + dy * dy)
    var theta = Math.PI * 1.5 - Math.atan2(dx, dy)

    var mid_percent = settings.mid_point / 100
    var width_percent = settings.core_width / 100

    var rotatePoint = function (pointX, pointY) {
      return [
        Math.cos(theta) * (pointX - coreX) - Math.sin(theta) * (pointY - coreY) + coreX,
        Math.sin(theta) * (pointX - coreX) + Math.cos(theta) * (pointY - coreY) + coreY
      ]
    }

    return _.flattenDeep([
      coreX, coreY,
      rotatePoint(coreX + mid_percent * length, coreY - width_percent * length),
      rotatePoint(coreX + length, coreY),
      rotatePoint(coreX + mid_percent * length, coreY + width_percent * length)
    ])
  },
  render: function (ctx, settings, points, frame_n) {
    if (_.size(points) < 4) {
      return
    }

    var n_side_e = settings.n_side_e
    var jitter = settings.jitter / 100
    var mid_percent = settings.mid_point / 100
    var width_percent = settings.core_width / 100

    var canvas2 = document.createElement('CANVAS')
    canvas2.width = ctx.canvas.width
    canvas2.height = ctx.canvas.height
    var ctx2 = canvas2.getContext('2d')
    ctx2.fillStyle = '#000000'
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height)
    ctx2.globalCompositeOperation = 'screen'

    var coreX = points[0]
    var coreY = points[1]
    var endX = points[2]
    var endY = points[3]
    var dx = coreX - endX
    var dy = coreY - endY
    var length = Math.sqrt(dx * dx + dy * dy)
    var theta = Math.PI * 1.5 - Math.atan2(dx, dy)

    var height = width_percent * length
    var frameW = 0.4

    drawEjection(ctx2, coreX, coreY, theta, height, length, mid_percent, frameW, jitter)

    var sideL = Math.max(0, 1.5 * height)
    var sideH = Math.max(0, 0.2 * sideL)
    for (var i = 0; i < n_side_e; i += 1) {
      var sideTheta = ((((2 * Math.PI) / n_side_e) * i) + (Math.PI / 2)) + theta
      drawEjection(ctx2, coreX, coreY, sideTheta, sideH, sideL, mid_percent, frameW, jitter)
    }

    applyGradient(ctx2, mkGradientEZ.apply(null, _.tail(settings.gradient)))

    ctx.drawImage(canvas2, 0, 0)
  }
}
