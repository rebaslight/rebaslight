var _ = require("lodash");
var bus = require("../event-bus");
var vdomHB = require("../vdom-hb");
var prevDflt = require("wrap-prevent-default");
var Exporter = require("../RLBrowser").Exporter;
var renderFrame = require("../renderFrame");
var ffmpeg_presets = require('../ffmpeg-presets');

var is_running = false;

var closeProgressBar = function(){
  vdomHB.update({
    waiting_progress_bars: _.omit(vdomHB.readState().waiting_progress_bars, "EXPORTING")
  });
};

var ffmpeg_output = "";

var onStopped = function(code){
  is_running = false;
  closeProgressBar();
  if(code !== 0){
    bus.emit("display-error", "Failed to export: " + code, void 0, ffmpeg_output);
    //TODO delete the file?
  }else{
    bus.emit("export-finished-successfully");
  }
};
var onError = function(error){
  is_running = false;
  closeProgressBar();
  bus.emit("display-error", "Export error: " + error);
};
var last_frame_from_ffmpeg = -1;
var onStatus = function(line){
  var parts = /^\s*frame=\s*([0-9]+)\s*/.exec(line);
  if(parts && (_.size(parts) > 1)){
    last_frame_from_ffmpeg = _.parseInt(parts[1], 10);
  }else{
    ffmpeg_output += line + "\n";
    console.log("[FFMPEG-status]", line);//eslint-disable-line no-console
  }
};

var exporter = Exporter({
  onStopped: onStopped,
  onError: onError,
  onStatus: onStatus
});

var mkBoundRenderFrameFn = function(main_source, layers, unlocked){
  var canvas = document.createElement("CANVAS");
  canvas.width = main_source.frame_w;
  canvas.height = main_source.frame_h;
  var ctx = canvas.getContext("2d");

  return function(frame_n){
    renderFrame(ctx, main_source, layers, frame_n, unlocked);//Exodus 20:15-16

    var img_url = canvas.toDataURL("image/png");

    var base64_str = img_url.replace(/^data:image\/\w+;base64,/, '');

    exporter.render(base64_str);
  };
};

module.exports = function(main_source, layers, unlocked){
  is_running = false;
  if(!main_source.export_file_path){
    closeProgressBar();
    bus.emit("display-error", "Error, no export file selected");
    bus.emit("show-ExportModal");
    return;
  }
  ffmpeg_output = "";
  exporter.start({
    preset: _.has(ffmpeg_presets, main_source.ffmpeg_preset)
      ? main_source.ffmpeg_preset
      : _.head(_.keys(ffmpeg_presets)),
    audio_file_path: main_source.file_path,
    export_file_path: main_source.export_file_path
  });

  var boundRenderFrame = mkBoundRenderFrameFn(main_source, layers, unlocked);

  var last_frame_rendered = -1;
  last_frame_from_ffmpeg = -1;

  var onSeeked;

  var onDone = function(){
    is_running = false;
    exporter.stop();
    bus.removeListener("seeked", onSeeked);

    closeProgressBar();
    vdomHB.update({
      waiting_progress_bars: _.assign({
      }, vdomHB.readState().waiting_progress_bars, {
        EXPORTING: {text: "Finalizing video..."}
      })
    });
  };
  var clickCancelExport = prevDflt(onDone);

  onSeeked = function(frame_n){
    if(!is_running){
      return;//prevent race conditions
    }
    if((frame_n - last_frame_from_ffmpeg) > (25 * 20)){//needs to be big enough of a gap to gaurentee that ffmpg has since given a status update
      //throttle down so ffmpeg can catch up
      setTimeout(function(){
        onSeeked(frame_n);
      }, 200);
      return;
    }

    if(last_frame_rendered === frame_n){
      frame_n += 1;//hack for when seeked on a frame border
    }
    last_frame_rendered = frame_n;

    vdomHB.update({
      waiting_progress_bars: _.assign({}, vdomHB.readState().waiting_progress_bars, {
        EXPORTING: {
          text: "Saving frame " + frame_n + "/" + main_source.n_frames,
          percent: 100*(frame_n / main_source.n_frames),
          onCancel: clickCancelExport
        }
      })
    });

    boundRenderFrame(frame_n);

    if(frame_n < main_source.n_frames){
      bus.emit("seek-to", frame_n + 1);
    }else{
      onDone();
    }
  };

  bus.on("seeked", onSeeked);

  is_running = true;
  bus.emit("seek-to", 0);
};
