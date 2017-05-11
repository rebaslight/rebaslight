var _ = require("lodash");
var h = require("virtual-dom/h");
var bus = require("../../event-bus");
var Modal = require("./Modal");
var Button = require("../Button");
var prevDflt = require("wrap-prevent-default");

var defaultClose = bus.signal("pop-generic_modal_q");

module.exports = function(props){
  var title = props.title || "";
  var body = props.body || "";
  var onClose = _.has(props, "onClose") ? props.onClose : defaultClose;
  var buttons = props.buttons || [];

  return Modal({
    title: title,
    onClose: onClose,
    buttons: _.map(buttons, function(btn){
      return Button({"ev-click": prevDflt(btn.onClick)}, btn.text);
    })
  }, h("p", {
    style: _.isString(body)
      ? {whiteSpace: "pre-line"}
      : null
  }, body));
};
