//////////// IMPORTS ////////////

var fs = require('fs');
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');

//////////// PRIVATE ////////////

/**
 * Convert a simple json object into another specifying children as an array
 * Works recursively
 *
 * example input:
 * { a: { b: { c: { size: 12 }, d: { size: 34 } }, e: { size: 56 } } }
 * example output
 * { name: a, children: [
 *   { name: b, children: [
 *     { name: c, size: 12 },
 *     { name: d, size: 34 }
 *   ] },
 *   { name: e, size: 56 }
 * ] } }
 */
function getChildren(json) {
  var children = [];
  if (json.language) return children;
  for (var key in json) {
    var child = { name: key };
    if (json[key].size) {
      // value node
      child.size = json[key].size;
      child.language = json[key].language;
    } else {
      // children node
      var childChildren = getChildren(json[key]);
      if (childChildren) child.children = childChildren;
    }
    children.push(child);
    delete json[key];
  }
  return children;
}

// convert the text in a cloc file to JSON
function clocToJson(clocData) {
  var lines = clocData.split("\n");
  lines.shift(); // drop the header line

  var json = {};
  lines.forEach(function(line) {
    var cols = line.split(',');
    var filename = cols[1];
    if (!filename) return;
    var elements = filename.split(/[\/\\]/);
    var current = json;
    elements.forEach(function(element) {
      if (!current[element]) {
        current[element] = {};
      }
      current = current[element];
    });
    current.language = cols[0];
    current.size = parseInt(cols[4], 10);
  });

  json = getChildren(json)[0];
  json.name = 'root';

  return json;
}

// run the cloc command on the given repo
function createClocFile(repo, socket) {
  var dirName = appConfig.repoToFolder(repo.fullName);

  var cd = 'cd ' + appConfig.paths.repos + dirName + '; ';
  var cloc = 'cloc ' + dirName +
             ' --csv --by-file ' + 
             '--ignored=ignored.txt ' +  
             '--report-file=data.cloc';

  socket.text('\n>> ' + cd + cloc);

  return execShellCommand(cd + cloc, socket);
}

// converts a cloc file to json
function convertClocFile(repo, socket) {
  var deferred = Q.defer();

  socket.text('\nConverting cloc file to json...');

  var dirName = appConfig.repoToFolder(repo.fullName);

  // read the cloc file
  var inFile = appConfig.paths.repos + dirName + '/data.cloc';
  fs.readFile(inFile, 'utf8', function(err, clocData) {
    if (err) {
      console.log(err);
      deferred.reject(err);
    } else {  
      // convert the cloc file to json
      var json = clocToJson(clocData);

      // make a new folder for the user
      var outFilePath = appConfig.paths.repos + dirName + '/';
      mkpath.sync(outFilePath);

      // write out the json
      var outFile =  outFilePath + 'data.json';
      fs.writeFile(outFile, JSON.stringify(json), 'utf8', function(err) {
        if (err) {
          console.log(err);
          deferred.reject(err);
        }
        else {
          socket.text('Wrote ' + outFile);
          deferred.resolve();
        }
      });
    }
  });

  return deferred.promise;
}

//////////// EXPORTS ////////////

module.exports = {
  // generates a piece of Json representing a code flower for the given repo
  // uses the cloc command to analyze the repo
  generateJson: function(repo, socket) {
    return createClocFile(repo, socket)
    .then(function() {
      return convertClocFile(repo, socket);
    })
  }
};
