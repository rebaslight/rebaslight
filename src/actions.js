var _ = require("lodash");
var h = require("virtual-dom/h");
var bus = require("./event-bus");
var path = require("path");
var isNum = require("./isNum");
var vdomHB = require("./vdom-hb");
var backend = require("./backend");
var getPoints = require("./getPoints");
var mainSource = require("./main-source");
var Export = require("./export");
var Effects = require("./effects");
var toRlURL = require("./toRlURL");
var RLBrowser = require("./RLBrowser");
var toInt = function(n){
  return parseInt(n, 10) || 0;
};

setTimeout(function(){
  //run init after the app as been mounted
  backend.init();
}, 1);

var getCurrProjectID = function(){
  var state = vdomHB.readState();
  return _.has(state, ["current_project", "id"])
    ? state.current_project.id
    : null;
};

var pushConfirmModal = function(props){
  var onYes = _.isFunction(props.onYes) ? props.onYes : _.noop;
  var onClose = bus.signal("pop-generic_modal_q");

  bus.emit("push-generic_modal_q", {
    title: props.title || "Are you sure?",
    body: props.body || "Are you sure?",
    onClose: onClose,
    buttons: [
      {
        text: props.btn_yes_text || "Yes, I'm sure",
        onClick: function(){
          onYes();
          onClose();
        }
      },
      {
        text: props.btn_no_text || "No, nevermind",
        onClick: onClose
      }
    ]
  });
};

bus.on("seeked", function(frame_n, currentTime){
  var state = vdomHB.readState();
  if(_.has(state, ["waiting_progress_bars", "EXPORTING"])){
    //export mode, so ignore it
    return;
  }

  vdomHB.update({
    frame: frame_n,
    currentTime: currentTime
  });
});

bus.on("seek-inc-by", function(inc){
  mainSource.incFrameNBy(inc);
});
bus.on("seek-to", function(frame){
  mainSource.setFrameN(frame);
});

bus.on("show-about-modal", function(){
  vdomHB.update({show_AboutModal: true});
});
bus.on("hide-about-modal", function(){
  vdomHB.update({show_AboutModal: false});
});

bus.on("UnlockModal-show", function(){
  vdomHB.update({UnlockModal: true});
});
bus.on("UnlockModal-unsign", function(){
  backend.removeUnlocked();
});
bus.on("UnlockModal-hide", function(){
  vdomHB.update({UnlockModal: undefined});
});
bus.on("sign-to-unlock", function(signature){
  backend.signToUnlock(signature);
});

bus.on("set-preview_mode", function(is_on){
  if(is_on){
    var state = vdomHB.readState();
    var messages = [];
    _.each(_.get(state, ["current_project", "layers"]), function(layer){
      var effect = Effects[layer.effect_id];
      var points = getPoints(layer, state.frame);
      if(effect && (_.size(points) > 0)){
        var n_points = _.size(points)/2;
        if(isNum(effect.min_n_points) && effect.min_n_points > 0){
          if(n_points < effect.min_n_points){
            messages.push(
              "Looks like you only have " + n_points +" point" +(n_points > 1 ? "s" : "")
              + " on \"" + layer.name + "\"."
              + "\nFor the effect to work you need at least " + effect.min_n_points + " points."
            );
          }
        }
        //not possible to have too many b/c editor doesn't add those
      }
    });
    if(!_.isEmpty(messages)){
      bus.emit("push-generic_modal_q", {
        title: "Heads up!",
        body: h("div", {style: {whiteSpace: "pre-line"}}, [
          messages.join("\n\n")
        ]),
        onClose: bus.signal("pop-generic_modal_q"),
        buttons: [
          {
            text: "Ok",
            onClick: bus.signal("pop-generic_modal_q")
          }
        ]
      });
    }
  }
  vdomHB.update({preview_mode: !!is_on});
});

bus.on("set-unlocked", function(unlocked){
  //Exodus 20:15-16
  vdomHB.update({
    unlocked: _.isString(unlocked) && unlocked.trim().length > 0
      ? unlocked
      : undefined
  });
});

bus.on("set-currently_open_menu", function(id){
  var state = vdomHB.readState();
  if(id === state.currently_open_menu){
    vdomHB.update({currently_open_menu: undefined});
  }else{
    vdomHB.update({currently_open_menu: id});
  }
});

bus.on("select-layer", function(id){
  vdomHB.update({
    open_layer_id: id
  });
});
bus.on("new-project", function(){
  backend.openProject(null);//clear current_project_id
  vdomHB.update({
    show_OpenMainSource: true
  });
});
bus.on("open-project", function(id){
  vdomHB.update({
    waiting_progress_bars: _.assign({
      OPENING_CURRENT_PROJECT: {text: "loading project..."}
    }, vdomHB.readState().waiting_progress_bars)
  });
  backend.openProject(id);
});
bus.on("projects", function(projects){
  vdomHB.update({
    projects: projects
  });
});
bus.on("global_settings", function(global_settings){
  vdomHB.update({global_settings: global_settings});
});
bus.on("set-current_project", function(project){
  vdomHB.update({
    current_project: project,
    waiting_progress_bars: _.omit(vdomHB.readState().waiting_progress_bars, "OPENING_CURRENT_PROJECT")
  });
  if(!project){
    return;//do nothing modals/index will take it from here
  }
  var main_source = project.main_source;
  if(main_source){
    mainSource.open(main_source);
  }else{
    vdomHB.update({
      show_OpenMainSource: true
    });
  }
});
bus.on("set-main-source", function(file_info){
  backend.setMainSource(getCurrProjectID(), file_info);
  vdomHB.update({
    show_OpenMainSource: false
  });
});
bus.on("show_OpenMainSource", function(){
  vdomHB.update({
    show_OpenMainSource: true
  });
});
bus.on("hide_OpenMainSource", function(){
  vdomHB.update({
    show_OpenMainSource: false
  });
});
bus.on("set-main-source-info", function(info){
  backend.setMainSourceInfo(getCurrProjectID(), info);
});
bus.on("rotate-main-source", function(is_right){
  var state = vdomHB.readState();
  if(!_.has(state, ["current_project", "main_source", "url"])){
    return;
  }
  var main_source = state.current_project.main_source;

  var rotate_deg = toInt(main_source.rotate_deg);
  rotate_deg += is_right ? 90 : -90;

  //normalize degrees
  rotate_deg = rotate_deg % 360;
  if(rotate_deg < 0){
    rotate_deg += 360;
  }

  backend.setMainSourceInfo(getCurrProjectID(), {
    frame_w: main_source.frame_h,//swap w/h
    frame_h: main_source.frame_w,//swap w/h
    rotate_deg: rotate_deg
  });
});

bus.on("add-layer", function(effect_id){
  if(!_.has(Effects, effect_id)){
    bus.emit("display-error", "Not a valid effect_id: " + effect_id);
    return;
  }
  if(!_.isFunction(Effects[effect_id].render)){
    bus.emit("display-error", Effects[effect_id].human_name + " is not yet available.");
    return;
  }
  var new_layer_id = backend.addLayer(getCurrProjectID(), effect_id);
  vdomHB.update({
    preview_mode: false,//so they can start editing right away
    open_layer_id: new_layer_id
  });
});

bus.on("open-buy-effect-url", function(effect_id){
  window.location.assign(toRlURL("/effects"));
});

bus.on("delete-project", function(){
  var state = vdomHB.readState();
  if(!_.has(state, ["current_project", "id"])){
    return;
  }
  var project_id = state.current_project.id;//get this now b/c it may change by the time they click yes
  pushConfirmModal({
    body: "Are you sure you want to permanently delete this project?",
    onYes: function(){
      backend.deleteProject(project_id);
    }
  });
});
bus.on("delete-layer", function(layer_id){
  var state = vdomHB.readState();
  if(!_.has(state, ["current_project", "layers", layer_id])){
    return;
  }
  var project_id = state.current_project.id;//get this now b/c it may change by the time they click yes
  var layer_name = state.current_project.layers[layer_id].name;

  pushConfirmModal({
    body: "Are you sure you want to permanently delete \"" + layer_name + "\"?",
    onYes: function(){
      backend.deleteLayer(project_id, layer_id);
    }
  });
});
bus.on("save-points", function(project_id, layer_id, frame_n, points){
  backend.savePoints(project_id, layer_id, frame_n, points);
});
bus.on("remove-keyframe", function(layer_id, frame_n){
  backend.removeKeyframe(getCurrProjectID(), layer_id, frame_n);
});
bus.on("save-layer-settings", function(layer_id, settings){
  backend.saveLayerSettings(getCurrProjectID(), layer_id, settings);
});
bus.on("show-ExportModal", function(){
  vdomHB.update({
    show_ExportModal: true
  });
});
bus.on("close-ExportModal", function(){
  vdomHB.update({
    show_ExportModal: false
  });
});
bus.on("start-the-export-process", function(){
  var state = vdomHB.readState();
  if(!_.has(state, ["current_project", "main_source", "url"])){
    return;
  }
  var layers = state.current_project.layers;
  var main_source = state.current_project.main_source;
  if(!_.has(Export, main_source.type)){
    bus.emit("display-error", "Sorry, that export " + main_source.type + " is not yet supported");
    return;
  }

  vdomHB.update({
    show_ExportModal: false,
    waiting_progress_bars: _.assign({
      EXPORTING: {text: "Exporting " + main_source.type + "..."}
    }, vdomHB.readState().waiting_progress_bars)
  });

  Export[main_source.type](main_source, layers, state.unlocked);//Exodus 20:15-16
});

bus.on("clear-exported_image_download_url", function(){
  vdomHB.update({
    exported_image_download_url: null
  });
});


bus.on("main-source-start-loading", function(type){
  vdomHB.update({
    waiting_progress_bars: _.assign({
      MAIN_SOURCE_LOADING: {text: "loading " + type + "..."}
    }, vdomHB.readState().waiting_progress_bars)
  });
});
bus.on("main-source-done-loading", function(){
  vdomHB.update({
    waiting_progress_bars: _.omit(vdomHB.readState().waiting_progress_bars, "MAIN_SOURCE_LOADING")
  });
});

bus.on("export-finished-successfully", function(){
  var state = vdomHB.readState();
  if(!_.has(state, ["current_project", "main_source", "export_file_path"])){
    bus.emit("display-error", "No export_file_path found");
    return;
  }
  //get it now to ensure it doesn't change by the time they say yes
  var export_file_path = state.current_project.main_source.export_file_path;

  vdomHB.update({
    export_finished_modal: {
      file_path: export_file_path
    }
  });
});
bus.on("close-export_finished_modal", function(){
  vdomHB.update({export_finished_modal: undefined});
});

bus.on("open-video_player_modal", function(file_path){
  vdomHB.update({
    export_finished_modal: undefined,
    video_player_modal: {
      file_path: file_path
    }
  });
});

bus.on("close-video_player_modal", function(){
  vdomHB.update({video_player_modal: undefined});
});

bus.on("new-version-available", function(new_version){
  var q = vdomHB.readState().generic_modal_q;
  q = _.isArray(q) ? q : [];
  if(_.some(q, function(m){
    return /New version available/i.test(m && m.title);
  })){
    //don't enqueue more than once
    return;
  }
  bus.emit("push-generic_modal_q", {
    title: "New version available! v" + new_version,
    body: "Go to rebaslight.com and download the latest version: " + new_version,
    buttons: [
      {
        text: "Close",
        onClick: bus.signal("pop-generic_modal_q")
      }
    ]
  });
});

bus.on("push-generic_modal_q", function(data){
  var state = vdomHB.readState();
  var q = _.isArray(state.generic_modal_q)
    ? state.generic_modal_q
    : [];
  //TODO maintain presidence order i.e. error messages before other kinds??
  vdomHB.update({
    generic_modal_q: q.concat([data])
  });
});
bus.on("pop-generic_modal_q", function(){
  vdomHB.update({generic_modal_q: _.tail(vdomHB.readState().generic_modal_q)});
});
bus.on("pop-error_message_q", function(){
  vdomHB.update({error_message_q: _.tail(vdomHB.readState().error_message_q)});
});
bus.on("show-bad-browser-message", function(){
  bus.emit("display-error", "Looks like your web browser is out of date. Try using Google Chrome.");
});
bus.on("display-error", function(context_msg, error){
  if(/OUTDATED_BROWSER/.test("" + error)){
    bus.emit("show-bad-browser-message");
    return;
  }
  vdomHB.update({
    error_message_q: _.flattenDeep([vdomHB.readState().error_message_q, {
      context_msg: context_msg,
      error: error
    }])
  });
});
bus.on("initial-load-done", function(){
  vdomHB.update({
    waiting_progress_bars: _.omit(vdomHB.readState().waiting_progress_bars, "INITIAL_LOAD")
  });
});

bus.on("open-ConvertModal", function(conf){
  vdomHB.update({
    ConvertModal: conf
  });
});

bus.on("close-ConvertModal", function(input_file){
  vdomHB.update({
    ConvertModal: undefined
  });
});

var setConvertProgress = function(bar){
  vdomHB.update({
    waiting_progress_bars: _.assign({}, vdomHB.readState().waiting_progress_bars, {
      CONVERTING: bar
    })
  });
};

bus.on("start-Convert", function(conf){
  var input_n_frames = conf.input_n_frames;
  if(!_.isNumber(input_n_frames) || _.isNaN(input_n_frames)){
    input_n_frames = -1;
  }
  var c = RLBrowser.Converter({
    onStatus: function(line){
      var parts = /^\s*frame=\s*([0-9]+)\s*/.exec(line);
      var frame = -1;
      if(parts && (_.size(parts) > 1)){
        frame = _.parseInt(parts[1], 10) || -1;
      }
      if(frame < 0){
        setConvertProgress({text: "Converting..."});
        return;
      }
      var percent;
      if(input_n_frames > 0){
        percent = 100 * (frame / input_n_frames);
      }
      setConvertProgress({
        text: line,
        percent: percent
      });
    },
    onError: function(error){
      bus.emit("display-error", "Convert Error: " + error);
    },
    onStopped: function(code){
      if(code === 0){
        pushConfirmModal({
          title: "Done!",
          body: "The video conversion finished!\n\nWould you like to use it for this project?",
          btn_yes_text: "Yes",
          btn_no_text: "No",
          onYes: function(){
            bus.emit("set-main-source", {
              type: "video",
              name: path.basename(conf.output_file),
              file_path: conf.output_file,
              url: "file://" + conf.output_file//TODO check this works on windows
            });
          }
        });
      }else{
        bus.emit("display-error", "Convert Failed! " + code);
      }
      vdomHB.update({
        waiting_progress_bars: _.omit(vdomHB.readState().waiting_progress_bars, "CONVERTING")
      });
    }
  });
  setConvertProgress({text: "Converting..."});
  vdomHB.update({
    ConvertModal: undefined
  });
  c.start({
    input_file: conf.input_file,
    output_file: conf.output_file
  });
});
