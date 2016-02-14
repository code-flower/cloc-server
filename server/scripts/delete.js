var rimraf = require('rimraf');
var Q = require('q');

var REPO_DIR = 'server/repos/';

function deleteFiles(user) {
  var deferred = Q.defer(); 

  console.log("deleting:", REPO_DIR + user);
  rimraf(REPO_DIR + user, function() {
    deferred.resolve();
  });

  return deferred.promise;
}

module.exports = deleteFiles;

