var _ = require('lodash')
var flatInt = require('../flatInt')
var mkGradientEZ = require('./utils/mkGradientEZ')
var applyGradient = require('./utils/applyGradient')
var gradient_presets = require('./utils/gradient_presets')
var normalizeSettingsBasedOnUISchema = require('./utils/normalizeSettingsBasedOnUISchema')

var hack_offset_x = 10000
var hack_offset_y = 10000

var ui_schema = {
  glow_size: {
    'label': 'Glow Size',
    'type': 'slider',
    'default': 50,
    'slots': 500
  },
  glow_color: {
    'label': 'Glow Color',
    'type': 'gradient',
    'default': ['blue', 128, 100, 100, 255, 10]
  }
}

module.exports = {
  human_name: 'Laser Glow',
  min_n_points: 3,
  max_n_points: -1,
  normalizeSettings: function (settings_orig) {
    if (_.has(settings_orig, 'preset_color') && !_.has(settings_orig, 'glow_color')) {
      // backwards compatibility
      settings_orig = _.assign({}, settings_orig, {
        glow_color: _.has(gradient_presets, settings_orig.preset_color)
          ? [settings_orig.preset_color].concat(gradient_presets[settings_orig.preset_color].value)
          : ui_schema.glow_color['default']
      })
    }
    return normalizeSettingsBasedOnUISchema(ui_schema, settings_orig)
  },
  settingsUI: function (settings) {
    return ui_schema
  },
  render: function (ctx, settings, points) {
    var canvas2 = document.createElement('CANVAS')
    canvas2.width = ctx.canvas.width
    canvas2.height = ctx.canvas.height
    var ctx2 = canvas2.getContext('2d')
    ctx2.fillStyle = '#000000'
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height)
    ctx2.beginPath()
    var pi
    for (pi = 0; pi < points.length; pi += 2) {
      ctx2[pi === 0 ? 'moveTo' : 'lineTo'](
        points[pi + 0] - hack_offset_x,
        points[pi + 1] - hack_offset_y
      )
    }
    ctx2.closePath()
    ctx2.lineWidth = 0
    ctx2.fillStyle = '#FFFFFF'
    ctx2.shadowColor = '#FFFFFF'
    ctx2.shadowOffsetX = hack_offset_x
    ctx2.shadowOffsetY = hack_offset_y
    ctx2.imageSmoothingEnabled = true

    var blur_sizes = [settings.glow_size]
    while (_.last(blur_sizes) > 1) {
      blur_sizes.push(flatInt(_.last(blur_sizes) / 2))
    }
    _.forEach(blur_sizes, function (b) {
      ctx2.shadowBlur = b
      ctx2.fill()
    })

    applyGradient(ctx2, mkGradientEZ.apply(null, _.tail(settings.glow_color)))

    ctx.drawImage(canvas2, 0, 0)
  }
}
