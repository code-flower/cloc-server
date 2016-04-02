/////////// IMPORTS ///////////

var fs = require('fs');
var appConfig = require('../../shared/appConfig.js');

//////////// PUBLIC ///////////

// serves a list of the repos currently stored in repos/
module.exports = function serveSamples(response) {
  // get array of files in a directory,
  // not including .DS_Store
  var readNoDS = function(path) {
    return fs.readdirSync(path).filter(function(file) {
      return file !== '.DS_Store';
    });
  };

  // construct array of repos
  var repos = [];

  readNoDS(appConfig.paths.samples).forEach(function(repo) {
    var fileName = `${appConfig.paths.samples}${repo}/data.json`;
    var json = fs.readFileSync(fileName, 'utf8'); 
    repos.push({
      name: repo.replace('#', '/'),
      data: JSON.parse(json)
    });
  });

  // serve up the array
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(repos));
}