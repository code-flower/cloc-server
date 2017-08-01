////////////// IMPORTS ///////////////

var fs = require('fs');
var moment = require('moment');
var mkpath = require('mkpath');

var config = require('../../config');

////////////// PRIVATE ///////////////

function appendToLog(data) {
  var str = moment().format() + ',' + data + '\n';
  fs.appendFile(config.paths.logs + 'access.txt', str, function(err) {
    if (err)
      console.log("ERROR WRITING TO LOG:", err);
  });
}

/////////////// INIT /////////////////

// make sure there's a log directory
mkpath.sync(config.paths.logs);

///////////// EXPORTS ////////////////

module.exports = appendToLog;
