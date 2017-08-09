//////////// IMPORTS ////////////

var fs = require('fs');
var Q = require('q');
var config = require('../../config');
var deleteRepo = require('./delete');

//////////// PRIVATE ////////////

function getFile(fileName) {
  return Q.nfapply(fs.readFile, [fileName, 'utf8']);
}

function cleanIgnoredText(ignoredText, folderName) {
  var regex = new RegExp(folderName + '/', 'g');
  return ignoredText.split('\n').slice(1).map(function(line) {
    return line.replace(regex, '');
  }).join('\n');
}

function getFlower(reposDir, folderName, deleteAfter) {
  var repoDir = `${reposDir}${folderName}/`;

  return Q.all([
    getFile(repoDir + 'data.json'),
    getFile(repoDir + 'ignored.txt')
  ])
  .then(function(data) {

    if (deleteAfter)
      deleteRepo(folderName);

    return {
      repoData: JSON.parse(data[0]),
      ignored:  cleanIgnoredText(data[1], folderName)
    };
  });
}

//////////// EXPORTS ////////////

module.exports = getFlower;

