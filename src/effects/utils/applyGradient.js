module.exports = function(ctx, gradient){
  var d = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  var pi, r, g, b, avg;
  for(pi = 0; pi < d.data.length; pi += 4){
    r = d.data[pi+0];
    g = d.data[pi+1];
    b = d.data[pi+2];
    // ignore alpha

    avg = Math.floor((r+g+b)/3);

    d.data[pi+0] = gradient[avg][0];
    d.data[pi+1] = gradient[avg][1];
    d.data[pi+2] = gradient[avg][2];
  }
  ctx.putImageData(d, 0, 0);
};
