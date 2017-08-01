////////////// IMPORTS ///////////////

var fs = require('fs');
var moment = require('moment');
var mkpath = require('mkpath');

var appConfig = require('../../shared/appConfig');

////////////// PRIVATE ///////////////

function appendToLog(data) {
  var str = moment().format() + ',' + data + '\n';
  fs.appendFile(appConfig.paths.logs + 'access.txt', str, function(err) {
    if (err)
      console.log("ERROR WRITING TO LOG:", err);
  });
}

/////////////// INIT /////////////////

// make sure there's a log directory
mkpath.sync(appConfig.paths.logs);

///////////// EXPORTS ////////////////

module.exports = appendToLog;
