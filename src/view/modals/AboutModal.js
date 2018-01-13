var h = require("virtual-dom/h");
var Modal = require("./Modal");
var css_vars = require("../common_css");

module.exports = function(props){
  return Modal({
    title: "About",
    onClose: props.onClose
  }, h("div", [
    h("h3", "Rebaslight"),
    h("p", [
      "Copyright (c) 2018 Very Small Helm LLC",
    ]),
    h("p", [
      h("a." + css_vars.link, {
          href: "https://github.com/rebaslight/rebaslight/blob/master/LICENSE.md"
      }, "License Agreement")
    ])
  ]));
};
