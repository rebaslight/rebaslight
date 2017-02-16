var h = require("virtual-dom/h");
var Modal = require("./Modal");
var toRlURL = require("../../toRlURL");
var css_vars = require("../common_css");

module.exports = function(props){
  return Modal({
    title: "About",
    onClose: props.onClose
  }, h("div", [
    h("h3", "Rebaslight"),
    h("p", [
      "(C) Small Helm LLC ",
      (new Date()).getFullYear()
    ]),
    h("p", [
      h("a." + css_vars.link, {href: toRlURL("/terms.html")}, "Terms of Service"),
      " | ",
      h("a." + css_vars.link, {href: toRlURL("/privacy.html")}, "Privacy Policy")
    ]),
    h("p", [
      "No affiliation with Lucasfilm, Lucasarts, Star Wars, or Disney."
    ])
  ]));
};
