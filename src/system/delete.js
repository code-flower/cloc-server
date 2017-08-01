//////////// IMPORTS ////////////

var rimraf = require('rimraf');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');

//////////// EXPORTS ////////////

module.exports = function deleteRepo(repoName) {
  var deferred = Q.defer(); 
  var dirName = appConfig.repoToFolder(repoName);

  console.log("deleting folder:", dirName);
  rimraf(appConfig.paths.repos + dirName, deferred.resolve);

  return deferred.promise;
};

