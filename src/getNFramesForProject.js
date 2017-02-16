var getIn = require("get-in");

module.exports = function(project){
  return parseInt(getIn(project, ["main_source", "n_frames"]), 10) || 0;
};
