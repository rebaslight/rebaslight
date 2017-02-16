module.exports = function(fps){
  var frame_length = 1 / fps;
  return {
    frame_length: frame_length,
    frameToSeconds: function(frame){
      return frame / fps;
    },
    secondsToFrame: function(seconds){
      return Math.round(fps * seconds);
    },
    getNearestFrameSeconds: function(seconds){
      return Math.round(seconds/frame_length)*frame_length;
    }
  };
};
