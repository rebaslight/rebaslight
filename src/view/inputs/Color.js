var _ = require("lodash");
var h = require("virtual-dom/h");
var S = require("../styles");
var jsCSS = require("js-managed-css");

var css = jsCSS({
  "input.$color": {
    "display": "block",
    "box-sizing": "border-box",
    "height": '2em',
    "border": "1px solid "+S.color.black_bg,
    "padding": ".25em .5em",
    "border-radius": ".25em",
    "color": S.color.text,
    "background-color": S.color.dark_bg,
    "width": "100%",
    ":focus": {
      "outline": "none !important",
      "border-color": S.color.border_highlight+" !important"
    }
  }
});

module.exports = function(props){
  var value = props.value;
  var onChange = props.onChange;

  return h('input.' + css.color, {
    type: 'color',
    value: value,
    'ev-change': function(ev){
      if(_.isFunction(onChange)){
        onChange(ev.target.value);
      }
    },
    'ev-input': function(ev){
      if(_.isFunction(onChange)){
        onChange(ev.target.value);
      }
    }
  });
};
