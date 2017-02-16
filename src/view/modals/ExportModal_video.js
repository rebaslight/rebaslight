var _ = require('lodash');
var h = require("virtual-dom/h");
var bus = require("../../event-bus");
var path = require("path");
var Fact = require("../Fact");
var Select = require('../inputs/Select');
var SaveFileInput = require("../inputs/SaveFileInput");
var ffmpeg_presets = require('../../ffmpeg-presets');

var onPresetChange = function(preset){
  bus.emit('set-main-source-info', {
    ffmpeg_preset: preset
  });
};

module.exports = function(main_source){
  var export_file_path = main_source.export_file_path;
  if(!_.isString(export_file_path) || export_file_path.length === 0){
    var file_name = path.basename(main_source.file_path, path.extname(main_source.file_path));
    file_name = file_name.replace(/-RL.*/, "");
    export_file_path = path.join(
      path.dirname(main_source.file_path),
      file_name
    ) + "-RLout.mp4";
    process.nextTick(function(){
      bus.emit("set-main-source-info", {
        export_file_path: export_file_path
      });
    });
  }

  return h("div", {
    style: {
      marginTop: "1em"
    }
  }, [
    Fact("File", SaveFileInput({
      curr_file: export_file_path,
      onFileChanged: function(file_path){
        if(!/\.mp4$/.test(file_path)){
          bus.emit("display-error", "Only .mp4 export files are supported");
          return;
        }
        bus.emit("set-main-source-info", {
          export_file_path: file_path
        });
      }
    })),
    Fact("Type", "Video"),
    Fact("Format", Select({
      options: _.map(ffmpeg_presets, function(preset, key){
        return [key, preset.name];
      }),
      value: _.has(ffmpeg_presets, main_source.ffmpeg_preset)
        ? main_source.ffmpeg_preset
        : _.head(_.keys(ffmpeg_presets)),
      onSelect: onPresetChange
    })),
    Fact("Quality", "Maximum"),
    Fact("Size", main_source.frame_w + " x " + main_source.frame_h)
  ]);
};
