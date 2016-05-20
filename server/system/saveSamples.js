//////////// IMPORTS ////////////

var fs = require('fs');
var Q = require('q');
var appConfig = require('../../shared/appConfig');
var getFlower = require('./getFlower');
var mkpath = require('mkpath');

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
        name: appConfig.folderToRepo(sample),
        data: json
      };
    });
}

//////////// EXPORTS ////////////

// called during the gulp build
// this converts all of the sample repos in
// the samples directory to a single json file
// and save it at filepath

module.exports = function saveSamples(filepath) {
  return getSampleNames()
    .then(function(samples) {
      return Q.all(samples.map(function(sample) {
        return sampleToObject(sample);
      }));
    })
    .then(function(samples) {
      mkpath.sync(filepath.replace(/\/[^/]*?$/, ''));
      fs.writeFile(filepath, JSON.stringify(samples), function(err) {
        if (err)
          console.log("ERROR WRITING SAMPLES FILE:", err);
      });
    });
};
