var _ = require("lodash");
var h = require("virtual-dom/h");
var S = require("../styles");
var bus = require("../../event-bus");
var Modal = require("./Modal");
var jsCSS = require("js-managed-css");
var Button = require("../Button");

var css_vars = jsCSS({
  ".$ClickableItem:hover": {
    "background-color": S.color.highlight+" !important"
  }
});

var ClickableItem = function(props, body){
  var onClick = props.onClick;

  return h("a." + css_vars.ClickableItem, {
    href: "#",
    style: {
      color: S.color.text,
      display: "block",
      padding: ".5em",
      textDecoration: "none"
    },
    "ev-click": onClick
  }, body);
};

module.exports = function(state){
  return Modal({
    title: "Open a Project",
    buttons: [
      Button({"ev-click": bus.signal("new-project")}, "new project")
    ]
  }, h("div", {}, _.map(state.projects, function(project){
    return ClickableItem({
      onClick: bus.signal("open-project", project.id)
    }, project.name);
  })));
};
