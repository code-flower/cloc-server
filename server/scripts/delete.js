var rimraf = require('rimraf');
var Q = require('q');

var REPO_DIR = 'server/repos/';
var CLOC_DIR = 'server/cloc-data/';
var JSON_DIR = 'client/data/';

function deleteFiles(user, repo, SSE) {
  var deferred = Q.defer(); 

  SSE.write('deleting ' + REPO_DIR + user);
  rimraf(REPO_DIR + user, function() {
    SSE.write('deleting ' + CLOC_DIR + user);
    rimraf(CLOC_DIR + user, function() {
      deferred.resolve();
    });
  });

  return deferred.promise;
}

module.exports = deleteFiles;

