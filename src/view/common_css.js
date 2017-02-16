var S = require("./styles");
var jsCSS = require("js-managed-css");

module.exports = jsCSS({
  "a.$link": {
    "color": S.color.link,
    "text-decoration": "none",
    ":hover": {
      "color": S.color.link_hover,
      "text-decoration": "underline"
    }
  }
});
