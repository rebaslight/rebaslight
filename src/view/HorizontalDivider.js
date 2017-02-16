var h = require("virtual-dom/h");
var S = require("./styles");

module.exports = function(props){
  return h("div", {
    style: {
      height: S.sizes.divider + "px",
      background: "linear-gradient(to bottom, "+S.color.gradient.light+")"
    }
  });
};
