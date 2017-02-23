var _ = require("lodash");
var h = require("virtual-dom/h");
var S = require("../styles");
var bus = require("../../event-bus");
var Modal = require("./Modal");
var jsCSS = require("js-managed-css");
var Button = require("../Button");
var prevDflt = require("wrap-prevent-default");
var css_vars = require("../common_css");

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
  var onClose = bus.signal("UnlockModal-hide");
  if(state.unlocked){
    return Modal({
      title: "Unlocked!",
      onClose: onClose,
      buttons: []
    }, h("div", [
      h("p", [
        "Thank you for purchasing a user license!"
      ]),
      h("p", [
        h("a." + css_vars.link, {
            href: "https://github.com/rebaslight/rebaslight/blob/master/LICENSE.md"
        }, "License Agreement")
      ]),
      h("a." + css_vars.link, {
        href: "#",
        "ev-click": bus.signal("UnlockModal-unsign"),
        style: {
          float: "right"
        }
      }, "remove"),
      "Your Signature:",
      h("div", {
        style: {
          fontFamily: "monospace",
          background: S.color.light_bg,
          borderRadius: "10px",
          padding: "10px",
          margin: "5px 0 10px 0",
        }
      }, state.unlocked),
      h("p", [
        "Thank you!"
      ]),
      h("div", [
        Button({onClick: prevDflt(onClose)}, "Ok"),
        h("a." + css_vars.link, {
          href: "#",
          "ev-click": bus.signal("UnlockModal-unsign"),
          style: {
            marginLeft: "1em"
          }
        }, "un-sign")
      ])
    ]));
  }
  return Modal({
    title: "Unlock",
    onClose: onClose,
    buttons: []
  }, h("form", {"ev-submit": function(e){
    e.preventDefault();
    var data = formNodeToData(e.target);
    if(!_.isString(data.signature)){
        //TODO
    }
    var str = data.signature;
    str += " on " + (new Date()).toISOString();
    bus.emit("sign-to-unlock", str);
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
