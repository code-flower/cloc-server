//////////// IMPORTS ////////////

var rimraf = require('rimraf');
var Q = require('q');
var config = require('../../config');

//////////// EXPORTS ////////////

module.exports = function deleteRepo(folderName) {
  var deferred = Q.defer(); 

  console.log("deleting folder:", folderName);
  rimraf(config.paths.repos + folderName, deferred.resolve);

  return deferred.promise;
};

