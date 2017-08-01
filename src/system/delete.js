//////////// IMPORTS ////////////

var rimraf = require('rimraf');
var Q = require('q');
var config = require('../../config');

//////////// EXPORTS ////////////

module.exports = function deleteRepo(repoName) {
  var deferred = Q.defer(); 
  var dirName = config.repoToFolder(repoName);

  console.log("deleting folder:", dirName);
  rimraf(config.paths.repos + dirName, deferred.resolve);

  return deferred.promise;
};

