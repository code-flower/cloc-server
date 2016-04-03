//////////// IMPORTS ////////////

var fs = require('fs');
var appConfig = require('../../shared/appConfig.js');
var deleteRepo = require('./delete');

//////////// EXPORTS ////////////

module.exports = function getFlower(repoName) {
  var dirName = repoName.replace('/', '#');
  var absPath = `${appConfig.paths.repos}${dirName}/data.json`;
  var readStream = fs.createReadStream(absPath);
  readStream.on('end', function() {
    deleteRepo(repoName);
  });

  return readStream;
};