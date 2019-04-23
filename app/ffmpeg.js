'use strict'
const path = require('path')
const spawn = require('child_process').spawn
const ipcMain = require('electron').ipcMain
const ffmpegPresets = require('./ffmpeg-presets')
const split2 = require('split2')

const ffmpegPath = path.join(__dirname, '../../ffmpeg')

let f

ipcMain.on('ffmpeg-start', function (event, opts) {
  if (f) {
    f.stdin.end()
    f = null
  }
  if (!/ffmpeg(\.exe)?$/i.test(ffmpegPath)) {
    return
  }
  if (!ffmpegPresets.hasOwnProperty(opts.preset)) {
    event.sender.send('ffmpeg-error', 'Invalid export preset.')
    event.sender.send('ffmpeg-stopped', 1)
    return
  }
  var args = []
  args.push('-y')// overwrite files without asking
  args.push('-stats')

  // frames input
  args.push(['-f', 'image2pipe'])
  args.push(['-framerate', opts.use_fps || '25'])
  args.push(['-s', opts.frame_w + 'x' + opts.frame_h])
  args.push(['-c:v', 'png'])
  args.push(['-i', '-'])

  if (opts.use_fps) {
    // main source
    args.push(['-i', opts.audio_file_path])
    // compose
    args.push([
      '-filter_complex',
      `[0:v]setsar=sar=1,format=rgba [effects];
       [1:v]setsar=sar=1,format=rgba [main];
       [main][effects]overlay[out]`
      // Why overlay? Because it will preserve the orginal framerate settings i.e. 30000/1001 fps
      //
      // Below is how to do a screen overlay,
      // However, the frames most likely will not line up; especially if it's variable fps.
      // `[0:v]setsar=sar=1,format=rgba [effects];
      //  [1:v]format=rgba [main];
      //  [main][effects]blend=all_mode=screen[out]
    ])
    args.push(['-map', '[out]']) // use the composed video
    args.push(['-map', '1:a?']) // use the audio from input 1 if exists
  } else {
    // main source
    args.push(['-vn'])// disable video
    args.push(['-i', opts.audio_file_path])
    // compose
    args.push(['-map', '0:v']) // use the composed video
    args.push(['-map', '1:a?']) // use the audio from input 1 if exists
    args.push(['-framerate', '25'])
  }

  args.push(['-s', opts.frame_w + 'x' + opts.frame_h])
  args.push(ffmpegPresets[opts.preset].args)

  // output file
  args.push(opts.export_file_path)

  f = spawn(ffmpegPath, [].concat.apply([], args))
  f.stdout.on('data', function (data) {
    // ffmpeg stdout does nothing
  })
  f.stderr.on('data', function (data) {
    event.sender.send('ffmpeg-status', data + '')
  })
  function onError (err) {
    event.sender.send('ffmpeg-error', String(err))
  }
  f.stdin.on('error', onError)
  f.stdout.on('error', onError)
  f.stderr.on('error', onError)
  f.on('error', onError)
  f.on('close', function (code) {
    event.sender.send('ffmpeg-stopped', code)
  })
})
ipcMain.on('ffmpeg-render-frame', function (event, base64str) {
  if (!f) {
    console.log('ERROR - called ffmpeg-render-frame before f is mounted')
    return
  }
  f.stdin.write(Buffer.from(base64str, 'base64'))
})
ipcMain.on('ffmpeg-stop', function (event) {
  if (f) {
    f.stdin.end()
    f = null
  }
})

ipcMain.on('ffmpeg-convert', function (event, opts) {
  if (!/ffmpeg(\.exe)?$/i.test(ffmpegPath)) {
    return
  }
  var args = []
  args.push('-y')// overwrite files without asking
  args.push('-stats')

  // input settings
  args.push(['-i', opts.input_file])

  // output settings
  // https://trac.ffmpeg.org/wiki/Encode/VP8
  args.push(['-c:v', 'libvpx'])
  args.push(['-qmin', '0'])
  args.push(['-qmax', '40'])
  args.push(['-crf', '4'])// By default the CRF value can be from 4–63, and 10 is a good starting point. Lower values mean better quality.
  args.push(['-b:v', '2M'])// Choose a higher bit rate if you want better quality. Note that you shouldn't leave out the -b:v option as the default settings will produce mediocre quality output
  args.push(['-c:a', 'libvorbis'])
  args.push(opts.output_file)

  var proc = spawn(ffmpegPath, [].concat.apply([], args))
  proc.stdout.on('data', function (data) {
    // ffmpeg stdout does nothing
  })
  proc.stderr.on('data', function (data) {
    event.sender.send('ffmpeg-convert-status', data + '')
  })
  function onError (err) {
    event.sender.send('ffmpeg-convert-error', String(err))
  }
  proc.stdin.on('error', onError)
  proc.stdout.on('error', onError)
  proc.stderr.on('error', onError)
  proc.on('error', onError)
  proc.on('close', function (code) {
    event.sender.send('ffmpeg-convert-stopped', code)
  })
})

ipcMain.on('ffmpeg-frame-table', function (event, opts) {
  if (!/ffmpeg(\.exe)?$/i.test(ffmpegPath)) {
    return
  }
  var args = []
  args.push(['-i', opts.input_file])
  args.push(['-vf', 'showinfo'])
  args.push(['-f', 'null'])
  args.push('-')

  let isMissingFrame = false
  const table = []

  var proc = spawn(ffmpegPath, [].concat.apply([], args))
  proc.stderr
    .pipe(split2())
    .on('data', function (line) {
      line = line.trim()
      const m = /\[Parsed_showinfo.*\] n:\s*([0-9]+).* pts_time:\s*([0-9.]+) /.exec(line)
      if (m) {
        const n = parseInt(m[1], 10)
        const time = parseFloat(m[2])
        if (n !== table.length) {
          isMissingFrame = true
          proc.kill()
        } else {
          table.push(time)
        }
      }
    })
  function onError (err) {
    event.sender.send('ffmpeg-frame-table-error', String(err))
  }
  proc.stdin.on('error', onError)
  proc.stdout.on('error', onError)
  proc.stderr.on('error', onError)
  proc.on('error', onError)
  proc.on('close', function (code) {
    if (isMissingFrame) {
      onError('Missing a frame\nffmpeg ' + JSON.stringify(args))
    } else {
      event.sender.send('ffmpeg-frame-table-done', table)
    }
  })
})
