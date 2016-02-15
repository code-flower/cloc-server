//////////////// IMPORTS ////////////////

var fs = require('fs');
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var Q = require('q');

/////////////// CONSTANTS ///////////////

var REPO_DIR = '/../repos/';

////////// PRIVATE FUNCTIONS ////////////

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
function createClocFile(user, repo, SSE) {
  var cd = 'cd ' + __dirname + REPO_DIR + user + '/; ';
  var cloc = 'cloc ' + repo +
             ' --csv --by-file ' + 
             '--ignored=reasons.txt ' +  
             '--report-file=../' + user + '/' + repo + '.cloc';

  SSE.write('');
  SSE.write('>> ' + cloc);

  return execShellCommand(cd + cloc, SSE);
}

// converts a cloc file to json
function convertClocFile(user, repo, SSE) {
  var deferred = Q.defer();

  SSE.write('');
  SSE.write('Converting cloc file to json...');

  // read the cloc file
  var inFile = __dirname + REPO_DIR + user + '/' + repo + '.cloc';
  fs.readFile(inFile, 'utf8', function(err, clocData) {
    if (err) {
      console.log(err);
      deferred.reject(err);
    } else {  
      // convert the cloc file to json
      var json = clocToJson(clocData);

      // make a new folder for the user
      var outFilePath = __dirname + REPO_DIR + user + '/';
      mkpath.sync(outFilePath);

      // write out the json
      var outFile =  outFilePath + repo + '.json';
      fs.writeFile(outFile, JSON.stringify(json), 'utf8', function(err) {
        if (err) {
          console.log(err);
          deferred.reject(err);
        }
        else {
          SSE.write('Wrote ' + outFile);
          deferred.resolve();
        }
      });
    }
  });

  return deferred.promise;
}

///////////// PUBLIC //////////////

module.exports = {
  // generates a piece of Json representing a code flower for the given repo
  // uses the cloc command to analyze the repo
  generateJson: function(user, repo, SSE) {
    return createClocFile(user, repo, SSE)
    .then(function() {
      return convertClocFile(user, repo, SSE);
    });
  }
};
