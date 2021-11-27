/* global fetch */
var bus = require('./event-bus')
var cuid = require('cuid')
var cur_v = require('../package.json').version
var semver = require('semver')
var RLBrowser = require('./RLBrowser')

var checkIfWereUpToDate = function () {
  fetch('https://www.rebaslight.com/latest.json?v=' + cuid()) // ?v= to avoid the http cache
    .then(res => res.json())
    .then(json => {
      if (json && typeof json.version === 'string' && semver.gt(json.version, cur_v)) {
        bus.emit('new-version-available', json.version)
      }
    })
    // eslint-disable-next-line
    .catch(err => {
      // Something went wrong... most likely no internet connection
    })
}

if (RLBrowser) {
  // only works on desktop app. (cross-origin policy)
  checkIfWereUpToDate()// first time
  setInterval(checkIfWereUpToDate, 30 * 60 * 1000)
}
