var h = require("virtual-dom/h");
var S = require("./styles");

module.exports = function(props){
  return h("div", {
    style: {
      height: "100%",
      background: "linear-gradient(to right, "+S.color.gradient.light+")"
    }
  });
};
