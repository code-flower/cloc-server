//////////// IMPORTS ////////////

var appConfig = require('../../shared/appConfig.js');
var getFlower = require('../system/').getFlower;
var serveJson = require('./serveJson');

//////////// EXPORTS ////////////

module.exports = function serveFlower(response, repoName) {
  getFlower(appConfig.paths.repos, repoName, appConfig.deleteAfterClone)
  .then(function(json) {
    serveJson(response, json);
  });
};