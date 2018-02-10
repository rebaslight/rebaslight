var _ = require("lodash");
var h = require("virtual-dom/h");
var S = require("./styles");
var bus = require("../event-bus");
var jsCSS = require("js-managed-css");
var flatInt = require("../flatInt");
var ClearFix = require("./ClearFix");
var getTimelineHeight = require("../getTimelineHeight");
var getNFramesForProject = require("../getNFramesForProject");

var layer_height = 40;
var frame_border = 1;
var frame_width = 6;
var frames_left_spacing = 20;
var handle_width = S.sizes.left_panels + S.sizes.divider;
var frame_height = layer_height/2;
var scrolling_under_y_offset = 2;

var css = jsCSS({
  ".$LayerHandle:hover": {
    "background": S.color.highlight+" !important"
  },
  ".$Frame": {
    display: "inline-block",
    width: (frame_width - frame_border) + "px",
    height: frame_height + "px",
    "margin-top": (layer_height/2 - (frame_height/2) - frame_border) + "px",

    "border-width": frame_border+"px",
    "border-right-width": "0px",
    "&:last-child": {
      "border-right-width": frame_border+"px",
    },

    "border-style": "solid",
    "border-color": "#717171",
    "&.$is_keyframe": {
      "background-color": "#DDA017"
    }
  }
});

var Frame = _.memoize(function(is_keyframe){
  return h("div." + css.Frame + (is_keyframe ? "." + css.is_keyframe : ""));
});

var LayerFrames = function(first_visible_frame, last_visible_frame, selected, keyframe_points){
  return h("div", {
    style: {
      background: selected ? S.color.selected_bg : undefined,
      height: layer_height + "px",
      whiteSpace: "nowrap",
      paddingLeft: ((first_visible_frame * frame_width) + frames_left_spacing) + "px",
      borderBottom: "1px solid " + S.color.border,
    }
  }, _.map(_.range(first_visible_frame, last_visible_frame + 1), function(i){
    return Frame(_.has(keyframe_points, i));
  }));
};

var LayerHandle = function(id, name, selected){
  return h("div." + css.LayerHandle, {
    "ev-click": bus.signal("select-layer", id),
    style: {
      width: handle_width + "px",
      cursor: "pointer",
      whiteSpace: "nowrap",
      overflow: "hidden",
      userSelect: "none",
      WebkitUserSelect: "none",
      lineHeight: layer_height + "px",
      background: selected ? S.color.selected_bg : undefined,
      textOverflow: "ellipsis",
      borderBottom: "1px solid " + S.color.border,
    }
  }, [
    h("div", {
      style: {
        float: "left",
        padding: "0 5px",
        margin: "0 10px 0 0",
        cursor: "move"
      }
    }, "::"),
    name
  ]);
};

module.exports = function(state){
  var timeline_h = getTimelineHeight(state);
  var layers = _.values(state && state.current_project && state.current_project.layers);
  var open_layer_id = state && state.open_layer_id;

  var frame_n = (state && state.frame) || 0;
  var n_frames = getNFramesForProject(state.current_project);
  var n_visible_frames = flatInt((((state && state.window_w) || 0) - S.sizes.left_panels) / frame_width);

  var frame_n_to_start_scrolling = flatInt(n_visible_frames / 2);
  var frame_n_to_stop_scrolling = flatInt(n_frames - .75 * n_visible_frames);
  var scroll_offset = Math.min(Math.max(0, frame_n - frame_n_to_start_scrolling), frame_n_to_stop_scrolling) * frame_width;
  if(n_frames < n_visible_frames){
    scroll_offset = 0;//no need to scroll
  }
  var is_scrolling_under = scroll_offset > frames_left_spacing;

  var first_visible_frame = Math.max(0, flatInt((scroll_offset - frames_left_spacing)/frame_width));
  var last_visible_frame = Math.min(n_frames, first_visible_frame + n_visible_frames);

  return h("div#RL-Timeline", {
    style: S.xstyle.absolute(S.xstyle.noselect({
      color: S.color.text,
      background: S.color.main_bg,
      overflowX: "hidden",
      overflowY: "auto"
    }))
  }, [
    h("div", {
      style: S.xstyle.absolute({
        right: "auto",
        display: "inline-block",//is to make the width right
        zIndex: S.z_indexes.timeline_layer_handles,
        background: S.color.main_bg,//must keep this to make the bg opaque
        bottom: 'auto',
        boxShadow: is_scrolling_under ? "2px 2px 10px 0px black" : undefined
      })
    }, _.map(layers, function(layer){
      return LayerHandle(layer.id, layer.name, layer.id === open_layer_id);
    })),
    h("div", {
      "ev-click": function(ev){
        var x = ev.pageX;
        x -= handle_width;
        x -= Math.max(0, frames_left_spacing - scroll_offset);
        x += first_visible_frame * frame_width;
        var frame = Math.floor(x / frame_width);

        var y = ev.pageY;
        y -= state.window_h - timeline_h;
        y -= is_scrolling_under ? scrolling_under_y_offset : 0;
        y += document.getElementById("RL-Timeline").scrollTop;
        var layer_n = Math.floor(y / (layer_height + 1));


        bus.emit("seek-to", frame);
        if(_.has(layers, [layer_n, "id"])){
          bus.emit("select-layer", layers[layer_n].id);

          if(ev.ctrlKey || ev.altKey || ev.metaKey || ((ev.which === 3) || (ev.button === 2))){
            bus.emit("remove-keyframe", layers[layer_n].id, frame);
          }
        }
      },
      style: {
        position: "absolute",
        top: is_scrolling_under ? scrolling_under_y_offset + "px" : 0,
        left: (handle_width - scroll_offset) + "px"
      }
    }, [
      h("div", {
        style: {
          position: "absolute",
          top: 0,
          left: (frames_left_spacing + (frame_n * frame_width) + frame_border) + "px",
          width: (frame_width - frame_border) + "px",
          bottom: 0,
          background: "black",
          opacity: .4
        }
      }),
      _.map(layers, function(layer){
        return LayerFrames(
          first_visible_frame,
          last_visible_frame,
          layer.id === open_layer_id,
          layer.keyframe_points
        );
      }),
      ClearFix()
    ])
  ]);
};
