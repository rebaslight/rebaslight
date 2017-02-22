var _ = require("lodash");
var h = require("virtual-dom/h");
var S = require("../styles");
var bus = require("../../event-bus");
var Modal = require("./Modal");
var jsCSS = require("js-managed-css");
var Button = require("../Button");

var css = jsCSS({
  "input.$text-input": {
    "display": "block",
    "border": "1px solid "+S.color.black_bg,
    "padding": ".25em .5em",
    "border-radius": ".25em",
    "box-sizing": "border-box", "color": S.color.text,
    "width": "100%",
    "background-color": S.color.dark_bg,
    ":focus": {
      "outline": "none !important",
      "border-color": S.color.border_highlight+" !important"
    }
  }
});

var formNodeToData = function(form_node){
  var data = {};
  var elms = form_node.elements;
  var i = 0;
  while(i < elms.length){
    var elm = elms[i];
    i += 1;
    if(_.isString(elm.name) && elm.name.length > 0){
      data[elm.name] = elm.value;
    }
  }
  return data;
};


module.exports = function(state){
  return Modal({
    title: "Unlock",
    onClose: bus.signal("hide-UnlockModal"),
    max_width: 300,
    buttons: []
  }, h("form", {"ev-submit": function(e){
    e.preventDefault();
    var data = formNodeToData(e.target);
    //console.log("TODO unlock", data);
  }}, [
    "TODO explain",
    h("div", {style: {"margin-bottom": "1em"}}, [
      h("label", ["Sign Your Name"]),
      h("input." + css["text-input"], {
        "name": "signature",
        "type": "text"
      })
    ]),
    "TODO date",
    Button({}, "Sign")
  ]));
};
