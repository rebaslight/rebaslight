import rgbToHex from 'rgb-hex'
import hexToRgb from 'hex-rgb'
var _ = require('lodash')
var h = require('virtual-dom/h')
var Color = require('./Color')
var Label = require('../Label')
var Select = require('./Select')
var Slider = require('./Slider')
var flatInt = require('../../flatInt')
var mkGradientEZ = require('../../effects/utils/mkGradientEZ')
var gradient_presets = require('../../effects/utils/gradient_presets')

var options = _.map(gradient_presets, function (p, key) {
  return [key, p.name]
})
options.push(['custom', 'Custom'])

var isFloat = function (n) {
  return _.isNumber(n) && !_.isNaN(n)
}

var normalize = function (g) {
  if (!_.isArray(g) || _.size(g) !== 6) {
    return ['custom', 0, 0, 0, 0, 0]
  }
  return _.map(g, function (val, i) {
    if (i === 0) {
      return val
    }
    if (!isFloat(val)) {
      return 0
    }
    return Math.min(255, Math.max(0, val))
  })
}

var GradientPreview = function (props) {
  var spec = mkGradientEZ.mkSpec.apply(null, props.gradient)
  var css = _.map(spec, function (sp) {
    return 'rgb(' + sp[1] + ',' + sp[2] + ',' + sp[3] + ') ' + flatInt((sp[0] / 255) * 100) + '%'
  })
  return h('div', {
    style: {
      margin: '.5em 0',
      background: 'linear-gradient(to right, ' + css.join(', ') + ')',
      height: '50px'
    }
  })
}

module.exports = function (props) {
  var value = normalize(props.value)
  var onChange = function (v) {
    props.onChange(v)
  }

  var is_custom = !_.has(gradient_presets, value[0])

  var gradient_value
  if (is_custom) {
    gradient_value = value.slice(1)
  } else {
    gradient_value = gradient_presets[value[0]].value
  }

  var mkSlider = function (index, name) {
    var slot = gradient_value[index]
    var slots = 255
    return h('div', [
      Label({label: name + ' (' + slot + '/' + slots + ')'}),
      Slider({
        slot: slot,
        slots: slots,
        onChange: function (slot) {
          var v = ['custom'].concat(_.clone(gradient_value))
          v[index + 1] = slot
          onChange(v)
        },
        area_height: 30
      })
    ])
  }

  return h('div', [
    Select({
      options: options,
      value: is_custom ? 'custom' : value[0],
      onSelect: function (v) {
        if (_.has(gradient_presets, v)) {
          onChange([v].concat(gradient_presets[v].value))
        } else {
          onChange(['custom'].concat(_.head(_.values(gradient_presets)).value))
        }
      }
    }),
    GradientPreview({gradient: gradient_value}),
    is_custom ? Label({label: 'Color'}) : null,
    is_custom ? Color({
      value: '#' + rgbToHex(gradient_value[1], gradient_value[2], gradient_value[3]),
      onChange: function (color) {
        const {red, green, blue} = hexToRgb(color)
        const v = ['custom', gradient_value[0], red, green, blue, gradient_value[4]]
        onChange(v)
      }
    }) : null,
    is_custom ? mkSlider(0, 'Position') : null,
    is_custom ? mkSlider(4, 'Hi-Tone') : null
  ])
}
module.exports.normalize = normalize
