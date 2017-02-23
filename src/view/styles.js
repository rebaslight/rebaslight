var _ = require("lodash");
var jsCSS = require("js-managed-css");

jsCSS({
  "body, html": {
    "cursor": "default",
    "font-size": "16px",
    "-webkit-touch-callout": "none",
    "-webkit-user-select": "none",
    "-khtml-user-select": "none",
    "-moz-user-select": "none",
    "-ms-user-select": "none",
    "-user-select": "none"
  },
  '::-webkit-scrollbar': {
    'width': '10px'
  },
  '::-webkit-scrollbar-track': {
    'box-shadow': 'inset 0 0 6px rgba(0,0,0,0.3)'
  },
  '::-webkit-scrollbar-thumb': {
    'border-radius': '10px',
    'background': 'rgba(0,0,0,0.4)'
  }
});

var color = {
  text: "#FCFCFC",
  text_error: "#FF8080",
  link: "#DDA017",
  link_hover: "#F0C76A",
  border: "#282828",
  border_highlight: "#DDA017",
  main_bg: "#595959",
  dark_bg: "#282828",
  light_bg: "#888888",
  black_bg: "#000000",
  selected_bg: "#446292",
  highlight: "#0080FF",
  link_color: "#3D9EFF",
  link_highlight: "#6AB4FF",
  gradient: {
    light: "#7F7F7F, #545454",
    slider: "#A5CCF0, #287BE8",
    slider_handle: "#FCFCFC, #7F7F7F",
    slider_handle_active: "#FCFCFC, #FCFCFC",
    button: "#626262, #282828",
    button_hover: "#A5CCF0, #287BE8",
    button_active: "#282828, #287BE8",
    button_active_hover: "#626262, #287BE8"
  }
};

var style = {
  absolute: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  noselect: {
    cursor: "default",
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
    KhtmlUserSelect: "none",
    MozUserSelect: "none",
    MsUserSelect: "none",
    userSelect: "none"
  }
};

module.exports = {
  z_indexes: {
    modals:                 2000,
    magnifier:              1500,
    menu:                   1000,
    slider_handle:          200,
    timeline_layer_handles: 100
  },
  sizes: {
    divider: 10,
    mainsource_bar_height: 36,
    FrameEditorControls_width: 50,
    Debug_width: process.env.NODE_ENV === "production" ? 0 : 500,
    left_panels: 300,
    menu_height: 30
  },
  style: style,
  xstyle: _.mapValues(style, function(ignore, name){
    return function(customizations){
      return _.assign({}, style[name], customizations);
    };
  }),
  color: color
};
