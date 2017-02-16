var _ = require("lodash");
var h = require("virtual-dom/h");
var bus = require("../../event-bus");
var Label = require('../Label');
var Select = require("../inputs/Select");
var Slider = require("../inputs/Slider");
var Effects = require("../../effects");
var Gradient = require('../inputs/Gradient');

var inputs = {
  select: function(value, onChange, schema){
    return Select({
      options: schema.options,
      value: value,
      onSelect: onChange
    });
  },
  slider: function(value, onChange, schema){
    return Slider({
      slot: value,
      slots: schema.slots,
      onChange: onChange,
      area_height: 30
    });
  },
  gradient: function(value, onChange, schema){
    return Gradient({
      value: value,
      onChange: onChange
    });
  }
};

module.exports = function(layer){
  var effect = Effects[layer.effect_id];
  var settings = effect.normalizeSettings(layer.settings);

  var ui = effect.settingsUI(settings);

  var saveSetting = function(key, v){
    var o = {};
    o[key] = v;
    bus.emit('save-layer-settings', layer.id, o);
  };

  return h("div", _.map(ui, function(schema, key){
    var value = settings[key];
    var onChange = _.partial(saveSetting, key);
    return h("div", [
      Label({label: schema.label || key}),
      inputs[schema.type](value, onChange, schema)
    ]);
  }));
};
