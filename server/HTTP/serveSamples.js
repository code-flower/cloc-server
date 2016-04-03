/////////// IMPORTS ///////////

var fs = require('fs');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');

/////////// PRIVATE ///////////

function getSampleNames() {
  var deferred = Q.defer();

  fs.readdir(appConfig.paths.samples, function(err, files) {
    if (err)
      deferred.reject(err)
    else 
      deferred.resolve(files.filter(function(f) {
        return f !== '.DS_Store';
      }));
  });

  return deferred.promise;
}

function sampleToObject(sample) {
  var deferred = Q.defer();

  var fileName = `${appConfig.paths.samples}${sample}/data.json`;
  fs.readFile(fileName, 'utf8', function(err, json) {
    if (err)
      deferred.reject(err);
    else 
      deferred.resolve({
        name: sample.replace('#', '/'),
        data: JSON.parse(json)
      });
  });

  return deferred.promise;
}

/////////// EXPORTS ///////////

module.exports = function serveSamples(response) {

  getSampleNames()
  .then(function(samples) {
    return Q.all(samples.map(function(sample) {
      return sampleToObject(sample);
    }));
  })
  .then(function(samples) {
    response.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    response.end(JSON.stringify(samples));
  });

};

