var _ = require("lodash");
var vdomHB = require("../vdom-hb");
var renderFrame = require("../renderFrame");
var canvasToDownloadableURL = require("../canvasToDownloadableURL");

module.exports = function(main_source, layers, unlocked){
  setTimeout(function(){
    var canvas = document.createElement("CANVAS");
    canvas.width = main_source.frame_w;
    canvas.height = main_source.frame_h;
    var ctx = canvas.getContext("2d");

    renderFrame(ctx, main_source, layers, 0, unlocked);

    var exported_image_download_url = canvasToDownloadableURL(canvas);

    vdomHB.update({
      exported_image_download_url: exported_image_download_url,
      waiting_progress_bars: _.omit(vdomHB.readState().waiting_progress_bars, "EXPORTING")
    });
    //TODO offer them to delete the project??


  }, 100);//just long enough for the waiting bar to be rendered up
};
