var _ = require("lodash");

var layer_h = 41;//TODO get this from common source

module.exports = function(state){
  var n_layers = _.size(state && state.current_project && state.current_project.layers);
  return Math.min(150, (n_layers * layer_h) + (n_layers > 0 ? Math.floor(layer_h/2) : 0));
};
