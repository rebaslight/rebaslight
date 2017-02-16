module.exports = {
  x264_aac: {
    name: 'mp4',
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
};
