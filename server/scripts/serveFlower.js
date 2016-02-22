////////// IMPORTS //////////

var fs = require('fs');
var appConfig = require('../../shared/appConfig.js');
var deleteFiles = require('./delete.js');

////////// PUBLIC ///////////

module.exports = function serveFlower(response, repo) {
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  var absPath = `${appConfig.paths.repos}${repo}.json`;
  var readStream = fs.createReadStream(absPath);
  readStream.pipe(response);
  readStream.on('end', function() {
    var user = repo.match(/(^.*?)\//)[1];
    deleteFiles(user);
  });
};