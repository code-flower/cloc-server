/////////// IMPORTS ///////////

var fs = require('fs');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');

/////////// PRIVATE ///////////

function getSampleNames() {
  return Q.nfapply(fs.readdir, [appConfig.paths.samples])
  .then(function(files) {
    return files.filter(function(f) {
      return f !== '.DS_Store';
    });
  });
}

function sampleToObject(sample) {
  var fileName = `${appConfig.paths.samples}${sample}/data.json`;
  return Q.nfapply(fs.readFile, [fileName, 'utf8'])
  .then(function(json) {
    return {
      name: sample.replace('#', '/'),
      data: JSON.parse(json)
    };
  });
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

