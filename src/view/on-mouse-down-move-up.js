var Delegator = require('dom-delegator')
var delegator = Delegator()

module.exports = function (onMouseDown, onMouseMove, onMouseUp) {
  delegator.listenTo('mousedown')
  delegator.listenTo('mousemove')
  delegator.listenTo('mouseup')
  delegator.addGlobalEventListener('mousedown', onMouseDown)
  delegator.addGlobalEventListener('mousemove', onMouseMove)
  delegator.addGlobalEventListener('mouseup', onMouseUp)

  return function () {
    delegator.unlistenTo('mousedown')
    delegator.unlistenTo('mousemove')
    delegator.unlistenTo('mouseup')
    delegator.removeGlobalEventListener('mousedown', onMouseDown)
    delegator.removeGlobalEventListener('mousemove', onMouseMove)
    delegator.removeGlobalEventListener('mouseup', onMouseUp)
  }
}
