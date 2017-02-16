var _ = require("lodash");
var h = require("virtual-dom/h");
var S = require("../styles");
var Button = require("../Button");
var prevDflt = require("wrap-prevent-default");

var padding = 5;
var y_offset = 100;
var header_height = 30;

module.exports = function(props, body){
  var title = props.title || "";
  var onClose = props.onClose;
  var max_width = props.max_width || 400;
  var buttons = props.buttons;
  if(!_.has(props, "buttons") && !!onClose){
    buttons = [
      Button({onClick: prevDflt(onClose)}, "Ok")
    ];
  }

  return h("div", {
    style: S.xstyle.noselect({
      background: S.color.black_bg,
      margin: y_offset + "px auto 0 auto",
      maxWidth: max_width + "px",
      padding: padding + "px",
      borderRadius: padding + "px"
    })
  }, [
    h("div", {
      style: {
        position: "relative",
        color: S.color.text,
        height: header_height + "px",
        lineHeight: header_height + "px"
      }
    }, [
      title,
      onClose ? h("a", {
        href: "#",
        "ev-click": prevDflt(onClose),
        style: {
          position: "absolute",
          top: "-" + padding + "px",
          right: "-" + padding + "px",
          lineHeight: header_height + "px",
          width: "2em",
          textAlign: "center",
          color: S.color.text,
          textDecoration: "none",
          fontWeight: "bold"
        }
      }, "x") : null
    ]),
    h("div", {
      style: {
        color: S.color.text,
        background: S.color.main_bg
      }
    }, [
      h("div", {
        style: {
          padding: padding + "px"
        }
      }, body),
      _.size(buttons) > 0 ? h("div", {
          style: {
            padding: padding + "px"
          }
        },
        _.flattenDeep(_.map(buttons, function(btn){
          return [" ", btn];
        }))
      ) : null
    ])
  ]);
};
