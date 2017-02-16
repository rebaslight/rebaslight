var _ = require("lodash");

module.exports = function(names_so_far, prefix){
  var r = (new RegExp("^\\s*" + prefix + "\\s+([0-9]+)\\s*$", "i"));
  var max_n = _.max([-1].concat(_.filter(_.map(names_so_far, function(name){
    return r.test(name) ? parseInt(r.exec(name)[1], 10) : undefined;
  }), _.isNumber)));
  if(max_n < 0){
    return prefix;
  }
  return prefix + " " + (max_n + 1);
};
