var _ = require("lodash");
var h = require("virtual-dom/h");
var S = require("../styles");
var jsCSS = require("js-managed-css");

var css = jsCSS({
  "select.$select": {
    "display": "block",
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
  var options = props.options;
  var onSelect = props.onSelect;

  return h("select." + css.select, {
    value: value,
    "ev-change": function(ev){
      if(_.isFunction(onSelect)){
        onSelect(ev.target.value);
      }
    }
  }, _.map(options, function(opt){
    return h("option", {
      key: opt[0],
      value: opt[0],
      selected: opt[0] === value
    }, opt[1]);
  }));
};
