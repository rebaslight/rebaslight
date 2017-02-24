var _ = require("lodash");
var bus = require("./event-bus");
var xhr = require("xhr");
var cuid = require("cuid");
var cur_v = require("../package.json").version;
var semver = require("semver");
var RLBrowser = require("./RLBrowser");

var checkIfWereUpToDate = function(){
  xhr({
    url: "https://api.github.com/repos/rebaslight/rebaslight/releases/latest?v=" + cuid(),//to avoid the http cache
    json: true,
    headers: {
      "Content-Type": "application/json"
    }
  }, function(err, resp, body){
    var version = _.isString(resp && resp.body && resp.body.tag_name)
        ? resp.body.tag_name.replace(/^v/, "").trim()
        : null;
    if(_.isString(version) && version.length > 0){
      if(semver.gt(version, cur_v)){//only if it's newer (i.e. someone was sent a newer version to test out pre-launch)
        bus.emit("new-version-available", version);
      }
    }else{
      //Something went wrong... most likely no internet connection
    }
  });
};

if(RLBrowser){
  //only works on desktop app. (cross-origin policy)
  checkIfWereUpToDate();//first time
  setInterval(checkIfWereUpToDate, 30 * 60 * 1000);
}
