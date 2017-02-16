var _ = require("lodash");
var rSeed = require("seed-random");
var flatInt = require("../flatInt");
var mkGradientEZ = require("./utils/mkGradientEZ");
var applyGradient = require("./utils/applyGradient");
var normalizeSettingsBasedOnUISchema = require("./utils/normalizeSettingsBasedOnUISchema");

var hack_offset_x = 10000;
var hack_offset_y = 10000;

var lightningPoints = function(nextRandom, x1, y1, x2, y2, displacement, detail){
  if(displacement < detail){
    //base case
    return [x2, y2];
  }
  var mid_x = ((x2+x1)/2.0)+(nextRandom()-.5)*displacement;
  var mid_y = ((y2+y1)/2.0)+(nextRandom()-.5)*displacement;
  var r1 = lightningPoints(nextRandom, x1, y1, mid_x, mid_y, displacement/2, detail);
  var r2 = lightningPoints(nextRandom, mid_x, mid_y, x2, y2, displacement/2, detail);
  return r1.concat(r2);
};

var pointsToLightningPoints = function(nextRandom, settings, points){
  var core = {
    x: points[0],
    y: points[1]
  };
  var end = {
    x: points[2],
    y: points[3]
  };

  var length = Math.sqrt(Math.pow(core.x-end.x,2)+Math.pow(core.y-end.y,2));
  var furthest_from_baseline = (settings.displacement / 100) * length;

  var lpoints = lightningPoints(nextRandom, core.x, core.y, end.x, end.y, furthest_from_baseline, Math.max(1, settings.width));
  return [core.x, core.y].concat(lpoints);
};

var ui_schema = {
  width: {
    "label": "Core Width",
    "type": "slider",
    "default": 5,
    "slots": 50
  },
  displacement: {
    "label": "Displacement",
    "type": "slider",
    "default": 40,
    "slots": 100
  },
  glow_size: {
    "label": "Glow Size",
    "type": "slider",
    "default": 50,
    "slots": 500
  },
  gradient: {
    "label": "Color Gradient",
    "type": 'gradient',
    "default": ['blue', 128, 76, 162, 231, 10]
  }
};

module.exports = {
  human_name: "Lightning",
  min_n_points: 2,
  max_n_points: 2,
  normalizeSettings: function(settings_orig){
    return normalizeSettingsBasedOnUISchema(ui_schema, settings_orig);
  },
  settingsUI: function(settings){
    return ui_schema;
  },
  render: function(ctx, settings, points, frame_n){

    var canvas2 = document.createElement("CANVAS");
    canvas2.width = ctx.canvas.width;
    canvas2.height = ctx.canvas.height;
    var ctx2 = canvas2.getContext("2d");
    ctx2.fillStyle = "#000000";
    ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
    ctx2.lineWidth = settings.width;
    ctx2.strokeStyle = "#FFFFFF";
    ctx2.imageSmoothingEnabled = true;
    ctx2.lineCap = "round";
    ctx2.shadowColor = "#FFFFFF";
    ctx2.shadowOffsetX = hack_offset_x;
    ctx2.shadowOffsetY = hack_offset_y;
    ctx2.shadowBlur = 10;

    var nextRandom = rSeed("frame_n:" + frame_n);

    var lpoints = pointsToLightningPoints(nextRandom, settings, points);
    var pi;
    for(pi = 0; pi < lpoints.length; pi += 2){
      ctx2[pi === 0 ? "moveTo" : "lineTo"](
        flatInt(lpoints[pi + 0] - hack_offset_x),
        flatInt(lpoints[pi + 1] - hack_offset_y)
      );
    }

    var blur_sizes = [settings.glow_size];
    while(_.last(blur_sizes) > 1){
      blur_sizes.push(flatInt(_.last(blur_sizes) / 2));
    }
    _.forEach(blur_sizes, function(b){
      ctx2.shadowBlur = b;
      ctx2.stroke();
    });

    applyGradient(ctx2, mkGradientEZ.apply(null, _.tail(settings.gradient)));

    ctx.drawImage(canvas2, 0, 0);
  }
};
