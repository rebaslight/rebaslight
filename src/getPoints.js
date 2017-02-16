var _ = require("lodash");
var regression = require("./regression");

var getRegressionPoints = function(before_n, frame_n, after_n, before_points, after_points){
  var new_points = [];
  var i, bx, by, ax, ay;
  for(i = 0; i < before_points.length; i += 2){
    bx = before_points[i];
    by = before_points[i + 1];
    if(i < after_points.length){
      ax = after_points[i];
      ay = after_points[i + 1];
      new_points.push(regression(bx, ax, before_n, frame_n, after_n));
      new_points.push(regression(by, ay, before_n, frame_n, after_n));
    }else{
      new_points.push(bx);
      new_points.push(by);
    }
  }
  return new_points;
};

var getBeforeAndAfterFrameN = function(keyframe_points, frame_n){
  var keys = _.keys(keyframe_points);
  var before = -Infinity;
  var after = Infinity;
  var i, n;
  for(i=0; i < keys.length; i+=1){
    n = parseInt(keys[i], 10) || 0;
    if(n > frame_n){
      after = Math.min(after, n);
    }else{
      before = Math.max(before, n);
    }
  }
  return [before, after];
};

module.exports = function(layer, frame_n){
  if(!layer){
    return [];
  }
  if(!_.has(layer.keyframe_points, frame_n)){
    var bna = getBeforeAndAfterFrameN(layer.keyframe_points, frame_n);
    return getRegressionPoints(
      bna[0],
      frame_n,
      bna[1],
      _.has(layer.keyframe_points, bna[0]) ? layer.keyframe_points[bna[0]] : [],
      _.has(layer.keyframe_points, bna[1]) ? layer.keyframe_points[bna[1]] : []
    );
  }
  return layer.keyframe_points[frame_n];
};
