var _ = require('lodash');
var h = require("virtual-dom/h");
var path = require("path");
var css_vars = require("../common_css");
var prevDflt = require("wrap-prevent-default");
var RLBrowser = require("../../RLBrowser");

module.exports = function(props){

  var curr_file = props.curr_file;
  var onFileChanged = _.isFunction(props.onFileChanged)
    ? props.onFileChanged
    : _.noop;

  return h("a." + css_vars.link, {
    href: "#",
    "ev-click": prevDflt(function(){
      RLBrowser.showSaveDialog({
        title: "Save video",
        defaultPath: curr_file
      }, function(err, file_path){
        onFileChanged(file_path);
      });
    })
  }, path.basename(curr_file));
};
