//////////// IMPORTS ////////////

var config = require('../../config');
var getFlower = require('../system/').getFlower;
var serveJson = require('./serveJson');

//////////// EXPORTS ////////////

module.exports = function serveFlower(response, repoName) {
  getFlower(config.paths.repos, repoName, config.deleteAfterClone)
  .then(function(json) {
    serveJson(response, json);
  });
};