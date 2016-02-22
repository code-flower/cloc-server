//////// IMPORTS ////////

var rimraf = require('rimraf');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');

//////// PUBLIC /////////

module.exports = function deleteFiles(user) {
  var deferred = Q.defer(); 

  console.log("deleting repo:", user);
  rimraf(appConfig.paths.repos + user, function() {
    deferred.resolve();
  });

  return deferred.promise;
};

