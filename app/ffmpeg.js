"use strict";
const path = require("path");
const spawn = require("child_process").spawn;
const ipcMain = require("electron").ipcMain;
const output_settings = require('./ffmpeg-presets');

let ffmpeg_cmd_path = path.join(__dirname, "../ffmpeg");

let f;

ipcMain.on("ffmpeg-start", function(event, opts){
  if(f){
    f.stdin.end();
    f = null;
  }
  if(!/ffmpeg(\.exe)?$/i.test(ffmpeg_cmd_path)){
    return;
  }
  if(!output_settings.hasOwnProperty(opts.preset)){
    event.sender.send('ffmpeg-error', 'Invalid export preset.');
    event.sender.send('ffmpeg-stopped', 1);
    return;
  }
  var cli_args = [];
  cli_args.push('-y');//overwrite files without asking
  cli_args.push('-stats');

  //frames input
  cli_args.push(['-f', 'image2pipe']);
  cli_args.push(['-framerate', '25']);
  cli_args.push(['-c:v', 'png']);
  cli_args.push(['-i', '-']);

  //audio input
  cli_args.push(['-i', opts.audio_file_path]);

  //output settings
  cli_args.push(['-framerate', '25']);
  cli_args.push(output_settings[opts.preset].args);

  //output file
  cli_args.push(opts.export_file_path);

  f = spawn(ffmpeg_cmd_path, [].concat.apply([], cli_args));
  f.stdout.on("data", function(data){
    //ffmpeg stdout does nothing
  });
  f.stderr.on("data", function(data){
    event.sender.send("ffmpeg-status", data + "");
  });
  f.on("error", function(err){
    event.sender.send("ffmpeg-error", String(err));
  });
  f.on("close", function(code){
    event.sender.send("ffmpeg-stopped", code);
  });
});
ipcMain.on("ffmpeg-render-frame", function(event, base64_str){
  if(!f){
    console.log("ERROR - called ffmpeg-render-frame before f is mounted");
    return;
  }
  f.stdin.write(new Buffer(base64_str, "base64"));
});
ipcMain.on("ffmpeg-stop", function(event){
  if(f){
    f.stdin.end();
    f = null;
  }
});

ipcMain.on("ffmpeg-convert", function(event, opts){
  if(!/ffmpeg(\.exe)?$/i.test(ffmpeg_cmd_path)){
    return;
  }
  var cli_args = [];
  cli_args.push('-y');//overwrite files without asking
  cli_args.push('-stats');

  //input settings
  cli_args.push(['-i', opts.input_file]);

  //output settings
  //https://trac.ffmpeg.org/wiki/Encode/VP8
  cli_args.push(['-c:v', 'libvpx']);
  //cli_args.push(['-qmin', '0', '-qmax', '50']);
  cli_args.push(['-crf', '5']);//By default the CRF value can be from 4–63, and 10 is a good starting point. Lower values mean better quality.
  cli_args.push(['-b:v', '2M']);//Choose a higher bit rate if you want better quality. Note that you shouldn't leave out the -b:v option as the default settings will produce mediocre quality output
  cli_args.push(['-c:a', 'libvorbis']);
  cli_args.push(opts.output_file);

  var proc = spawn(ffmpeg_cmd_path, [].concat.apply([], cli_args));
  proc.stdout.on("data", function(data){
    //ffmpeg stdout does nothing
  });
  proc.stderr.on("data", function(data){
    event.sender.send("ffmpeg-convert-status", data + "");
  });
  proc.on("error", function(err){
    event.sender.send("ffmpeg-convert-error", String(err));
  });
  proc.on("close", function(code){
    event.sender.send("ffmpeg-convert-stopped", code);
  });
});
