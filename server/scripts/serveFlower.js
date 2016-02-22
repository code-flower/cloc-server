////////// IMPORTS //////////

var fs = require('fs');
var appConfig = require('../../shared/appConfig.js');
var deleteFolder = require('./delete.js');

////////// PUBLIC ///////////

module.exports = function serveFlower(response, repoName) {
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  var dirName = repoName.replace('/', '#');

  var absPath = `${appConfig.paths.repos}${dirName}/data.json`;
  var readStream = fs.createReadStream(absPath);
  readStream.pipe(response);
  readStream.on('end', function() {
    deleteFolder(dirName);
  });
};