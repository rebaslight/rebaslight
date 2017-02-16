var _ = require("lodash");
var h = require("virtual-dom/h");
var createElement = require("virtual-dom/create-element");

module.exports = function(src, o){
  var elm = createElement(h("img", {src: src}));
  var listners = {};
  if(_.isFunction(o && o.onMounted)){
    listners["load"] = function(){
      o.onMounted(elm);
    };
  }
  if(_.isFunction(o && o.onError)){
    listners["error"] = function(ev){
      o.onError(ev);
    };
  }
  _.forEach(listners, function(fn, name){
    elm.addEventListener(name, fn, false);
  });
  return {
    elm: elm,
    destroy: function(){
      _.forEach(listners, function(fn, name){
        elm.removeEventListener(name, fn, false);
      });
      //Anything else???
    }
  };
};
