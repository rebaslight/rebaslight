var _ = require("lodash");
var normalizeGradient = require('../../view/inputs/Gradient').normalize;

var hasOption = function(options, key){
  return _.some(options, function(opt){
    return opt[0] === key;
  });
};

var isFloat = function(n){
  return _.isNumber(n) && !_.isNaN(n);
};

module.exports = function(ui_schema, settings_orig){
  var settings = settings_orig || {};
  return _.mapValues(ui_schema, function(schema, key){
    var val = settings[key];
    if(schema.type === "select"){
      return hasOption(schema.options, val)
        ? val
        : schema["default"];
    }else if(schema.type === "slider"){
      return isFloat(val) && (0 <= val) && (val <= schema.slots)
        ? val
        : schema["default"];
    }else if(schema.type === "gradient"){
      if(_.isArray(val) && _.size(val) === 6){
        return normalizeGradient(val);
      }
      return normalizeGradient(schema["default"]);
    }
    return undefined;
  });
};
