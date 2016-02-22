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
  var repos = [],
      samples = appConfig.paths.samples,
      users = readNoDS(samples);

  users.forEach(function(user) {
    var repo = readNoDS(samples + user + '/').filter(function(file) {
      return file.match(/\.json/);
    })[0];
    var json = fs.readFileSync(samples + user + '/' + repo, 'utf8'); 
    repos.push({
      name: user + '/' + repo.replace('.json', ''),
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