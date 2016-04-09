//////////// IMPORTS ////////////

var fs = require('fs');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');
var getFlower = require('../system/').getFlower;

//////////// PRIVATE ////////////

function getSampleNames() {
  return Q.nfapply(fs.readdir, [appConfig.paths.samples])
    .then(function(files) {
      return files.filter(function(f) {
        return f !== '.DS_Store';
      });
    });
}

function sampleToObject(sample) {
  return getFlower(appConfig.paths.samples, sample, false)
    .then(function(json) {
      return {
        name: sample.replace('#', '/'),
        data: json
      };
    });
}

//////////// EXPORTS ////////////

module.exports = function serveSamples(response) {

  return getSampleNames()
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

