//////////// IMPORTS ////////////

var fs = require('fs');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');
var deleteRepo = require('./delete');

//////////// EXPORTS ////////////

function getFile(fileName) {
  return Q.nfapply(fs.readFile, [fileName, 'utf8']);
}

function getFlower(reposDir, repoName, deleteAfter) {
  var dirName = repoName.replace('/', '#');
  var repoDir = `${reposDir}${dirName}/`;

  return Q.all([
    getFile(repoDir + 'data.json'),
    getFile(repoDir + 'reasons.txt')
  ])
  .then(function(data) {

    if (deleteAfter)
      deleteRepo(repoName);

    return {
      repoData: JSON.parse(data[0]),
      reasons:  data[1]
    };
  });
}

module.exports = getFlower;

