////////////// IMPORTS /////////////

var fs = require('fs');
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var convertCloc = require('./dataConverter.js');
var Q = require('q');

///////////// CONSTANTS ////////////

var REPO_DIR = '/../repos/';
var CLOC_DIR = '/../cloc-data/';
var JSON_DIR = '/../../client/data/';

///////////// PRIVATE //////////////

// runs cloc
function createClocFile(user, repo, SSE) {
  var cd = 'cd ' + __dirname + REPO_DIR + user + '/; ';
  var cloc = 'cloc ' + repo +
             ' --csv --by-file ' + 
             '--ignored=../../reasons.txt ' +  
             '--report-file=../../cloc-data/' +
             user + '/' + repo + '.cloc';

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
  var inFile = __dirname + CLOC_DIR + user + '/' + repo + '.cloc';
  fs.readFile(inFile, 'utf8', function(err, data) {
    if (err) {
      console.log(err);
      deferred.reject(err);
    } else {  
      // convert the cloc file to json
      var json = convertCloc(data);

      // make a new folder for the user
      var outFilePath = __dirname + JSON_DIR + user + '/';
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
          // SSE.write('');
          // SSE.write('END:' + user + '/' + repo);
          // SSE.close();
          deferred.resolve();
        }
      });
    }
  });

  return deferred.promise;
}

////////// PUBLIC ////////////

module.exports = {
  createClocFile: createClocFile,
  convertClocFile: convertClocFile
};