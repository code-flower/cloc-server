//////////// IMPORTS ////////////

var appConfig = require('../../shared/appConfig.js');
var getFlower = require('../system/').getFlower;

//////////// EXPORTS ////////////

module.exports = function serveFlower(response, repoName) {
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });

  getFlower(repoName).pipe(response);
};