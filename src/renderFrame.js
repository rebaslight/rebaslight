var _ = require('lodash')
var flatInt = require('./flatInt')
var Effects = require('./effects')
var getPoints = require('./getPoints')
var mainSource = require('./main-source')

module.exports = function (ctx, main_source, layers, frame_n, unlocked, frameOffset) {
  var effectFrameN = Math.max(0, frame_n + (frameOffset || 0))

  ctx.clearRect(0, 0, main_source.frame_w, main_source.frame_h)

  ctx.globalCompositeOperation = 'screen'
  ctx.imageSmoothingEnabled = true

  mainSource.render(ctx, main_source)

  _.forEach(layers, function (layer) {
    var points = getPoints(layer, effectFrameN)
    if (_.has(Effects, layer.effect_id)) {
      var effect = Effects[layer.effect_id]
      var settings = effect.normalizeSettings(layer.settings)

      if (effect.min_n_points > 0) {
        if ((points.length / 2) < effect.min_n_points) {
          return// not enough points
        }
      }
      if (effect.max_n_points > 0) {
        if ((points.length / 2) > effect.max_n_points) {
          return// too many points
        }
      }

      effect.render(ctx, settings, points, effectFrameN)
    }
  })

  if (!unlocked) {
    // Dear coder,
    //
    // Congratulations! You found the super advanced, top-secret, ultra-secure DRM!
    // Open source does not always mean free as in gratis.
    // Rebaslight is free (no cost) to use as long as the "Made with Rebaslight" watermark appears on the output video/image.
    // However, if you make a one-time payment of $25 you may remove this watermark for yourself only.
    //
    // Don't be a jerk and redistribute a clone of Rebaslight under a different name.
    // Instead, join me, and together we can improve Rebaslight!
    //
    // Thank you for your integrity!
    //
    // - Matthew
    //
    var font_size = Math.max(10, flatInt(main_source.frame_w * 0.05))
    var txt = 'Made with Rebaslight'
    // "Thou shalt not steal. Thou shalt not bear false witness against thy neighbour." - Exodus 20:15-16
    ctx.font = font_size + 'px sans-serif'
    var txt_w = flatInt(ctx.measureText(txt).width)
    ctx.fillStyle = 'rgba(255, 255, 255, .7)'
    ctx.fillText(txt, 0, font_size)
    ctx.fillText(txt, main_source.frame_w - txt_w, main_source.frame_h - font_size)
  }
}
