var _ = require("lodash");
var h = require("virtual-dom/h");
var bus = require("../../event-bus");
var Fact = require("../Fact");
var jsCSS = require("js-managed-css");
var Modal = require("./Modal");
var Button = require("../Button");
var RLBrowser = require("../../RLBrowser");

var css_vars = jsCSS({
  "div.$alert": {
    cursor: "pointer",
    background: "#f2dede",
    margin: "10px",
    padding: "10px",
    "border-radius": "10px",
    color: "#a94442",
    border: "1px solid #ebccd1",
  },
  "a.$link": {
    "color": "#2525f4",
    "text-decoration": "none",
    ":hover": {
      "color": "#5555f6",
      "text-decoration": "underline"
    }
  },
});

var ControlsByType = {
  "image": function(main_source){
    return h("div", {
      style: {
        marginTop: "1em"
      }
    }, [
      Fact("Type", "Image"),
      Fact("Format", ".png"),
      Fact("Quality", "Maximum"),
      Fact("Size", main_source.frame_w + " x " + main_source.frame_h)
    ]);
  }
};

if(RLBrowser){
  ControlsByType["video"] = require("./ExportModal_video");
}

module.exports = function(state){
  var main_source = state.current_project.main_source;

  var body = _.has(ControlsByType, main_source.type) ? ControlsByType[main_source.type](main_source) : null;
  if(!body){
    return Modal({
      title: "Export",
      onClose: bus.signal("close-ExportModal")
    }, h("div", [
      "Sorry, but " + main_source.type + " export is not currently supported."
    ]));
  }

  return Modal({
    title: "Export",
    onClose: bus.signal("close-ExportModal"),
    buttons: [
      Button({"ev-click": bus.signal("start-the-export-process")}, "Export!")
    ]
  }, h("div", [
    body,
    state.unlocked
      ? h("span")
      : h("div." + css_vars.alert, {
        "ev-click": bus.signal("UnlockModal-show"),
      }, [
        "To remove the TRIAL VERSION watermarks purchase the \"",
        h("a." + css_vars.link, {
          href: "#",
          "ev-click": bus.signal("UnlockModal-show"),
        }, "Rebaslight user license"),
        "\"",
      ]),
  ]));
};
