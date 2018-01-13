var _ = require("lodash");
var flatInt = require("./flatInt");
var Effects = require("./effects");
var getPoints = require("./getPoints");
var mainSource = require("./main-source");

module.exports = function(ctx, main_source, layers, frame_n, unlocked){
  ctx.clearRect(0, 0, main_source.frame_w, main_source.frame_h);

  ctx.globalCompositeOperation = "screen";
  ctx.imageSmoothingEnabled = true;

  mainSource.render(ctx, main_source);

  _.forEach(layers, function(layer){
    var points = getPoints(layer, frame_n);
    if(_.has(Effects, layer.effect_id)){
      var effect = Effects[layer.effect_id];
      var settings = effect.normalizeSettings(layer.settings);

      if(effect.min_n_points > 0){
        if((points.length / 2) < effect.min_n_points){
          return;//not enough points
        }
      }
      if(effect.max_n_points > 0){
        if((points.length / 2) > effect.max_n_points){
          return;//too many points
        }
      }

      effect.render(ctx, settings, points, frame_n);
    }
  });

  if(!unlocked){
    //Exodus 20:15-16
    var font_size = Math.max(10, flatInt(main_source.frame_w * .05));
    var txt = "Rebaslight Trial Version";

    ctx.font = font_size + "px sans-serif";
    var txt_w = flatInt(ctx.measureText(txt).width);
    ctx.fillStyle = "rgba(255, 255, 255, .7)";
    ctx.fillText(txt, 0, font_size);
    ctx.fillText(txt, main_source.frame_w - txt_w, main_source.frame_h - font_size);
  }
};
