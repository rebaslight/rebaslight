var vdom = require('virtual-dom')
var main = require('main-loop')
var xtend = require('xtend')
var Delegator = require('dom-delegator')

var loop
var initial_state = {}

var delegator = Delegator()// somehow this magic makes ev-* work

module.exports = {
  init: function (render) {
    loop = main(initial_state, render, vdom)
    initial_state = null// all done with this
    return loop.target
  },
  update: function (o) {
    if (loop) {
      loop.update(xtend(loop.state, o))
    } else {
      initial_state = xtend(initial_state, o)
    }
  },
  readState: function () {
    if (loop) {
      return loop.state
    } else {
      return initial_state
    }
  },
  delegator: delegator
}
