var _ = require("lodash");
var prevDflt = require("wrap-prevent-default");
var EventEmitter = require("events");

var emitter = new EventEmitter();

module.exports = {
  on: _.bind(emitter.on, emitter),
  emit: _.bind(emitter.emit, emitter),
  removeListener: _.bind(emitter.removeListener, emitter),
  signal: function(){
    var fn = _.bind.apply(null, [emitter.emit, emitter].concat(_.toArray(arguments)));
    return prevDflt(function(){
      fn();
    });
  }
};
