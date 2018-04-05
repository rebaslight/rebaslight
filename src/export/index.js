var RLBrowser = require('../RLBrowser')
module.exports = {
  'image': require('./image')
}
if (RLBrowser) {
  module.exports['video'] = require('./video')
}
