module.exports = {
  // https://trac.ffmpeg.org/wiki/Encode/H.264
  x264_aac_hq: {
    name: 'mp4',
    can_play_in_app: true,
    args: [
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-tune', 'film',
      '-profile:v', 'high',
      '-level', '4.0',
      '-pix_fmt', 'yuv420p',
      '-codec:a', 'aac',
      '-strict', 'experimental'
    ]
  },
  x264_aac: {
    name: 'mp4 (legacy)',
    can_play_in_app: true,
    args: [
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-profile:v', 'baseline',
      '-level', '3.0',
      '-pix_fmt', 'yuv420p',
      '-codec:a', 'aac',
      '-strict', 'experimental'
    ]
  },
  windows_mp4: {
    name: 'mp4 (windows)',
    args: [
      '-codec:v', 'mpeg4',
      '-flags:v', '+qscale',
      '-global_quality:v', '0',
      '-codec:a', 'libmp3lame'
    ]
  }
}
