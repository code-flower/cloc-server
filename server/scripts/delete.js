//////// IMPORTS ////////

var rimraf = require('rimraf');
var Q = require('q');

//////// CONSTANTS //////

var REPO_DIR = 'server/repos/';

//////// PUBLIC /////////

module.exports = function deleteFiles(user) {
  var deferred = Q.defer(); 

  console.log("deleting:", REPO_DIR + user);
  rimraf(REPO_DIR + user, function() {
    deferred.resolve();
  });

  return deferred.promise;
};

