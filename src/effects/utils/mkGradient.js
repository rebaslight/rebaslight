var _ = require("lodash");
var regression = require("../../regression");

module.exports = function(colors){
  var prev = _.head(colors);
  var gradient = [];
  _.forEach(_.tail(colors), function(c){
    _.forEach(_.range(prev[0], c[0]), function(n){
      gradient.push([
        regression(prev[1], c[1], prev[0], n, c[0]),
        regression(prev[2], c[2], prev[0], n, c[0]),
        regression(prev[3], c[3], prev[0], n, c[0])
      ]);
    });
    prev = c;
  });
  return gradient;
};
