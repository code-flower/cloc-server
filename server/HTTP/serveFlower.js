//////////// IMPORTS ////////////

var appConfig = require('../../shared/appConfig.js');
var getFlower = require('../system/').getFlower;

//////////// EXPORTS ////////////

module.exports = function serveFlower(response, repoName) {
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  return getFlower(appConfig.paths.repos, repoName, appConfig.deleteAfterClone)
    .then(function(data) {  
      response.end(JSON.stringify(data));
    });
};