var h = require("virtual-dom/h");
var ClearFix = require("./ClearFix");

module.exports = function(key, val, opts){
  return h("div", {style: {margin: "0 0 1em 0"}}, [
    h("b", {style: {
      textAlign: "right",
      "float": "left",
      display: "inline-block",
      width: (opts && opts.width) || "80px",
      margin: "0 .5em 0 0"
    }}, key),

    h('div', {style: {'float': 'left'}}, val),

    ClearFix()
  ]);
};
