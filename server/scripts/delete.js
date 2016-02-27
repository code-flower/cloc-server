//////// IMPORTS ////////

var rimraf = require('rimraf');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');

//////// PUBLIC /////////

module.exports = function deleteRepo(repoName) {
  var deferred = Q.defer(); 
  var dirName = repoName.replace('/', '#');

  console.log("deleting folder:", dirName);
  rimraf(appConfig.paths.repos + dirName, function() {
    deferred.resolve();
  });

  return deferred.promise;
};

