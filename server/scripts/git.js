/////// IMPORTS ///////

var exec = require('child_process').exec;
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var Q = require('q');

/////// CONSTANTS /////

var REPO_DIR = '/../repos/';

//////// PRIVATE /////

// returns a promise with data === true if repo is private, otherwise false
function privateRepo(user, repo) {
  console.log("checking privacy: ", user, repo);

  var deferred = Q.defer();

  var curl = 'curl https://api.github.com/repos/' + user + '/' + repo;
  exec(curl, function(error, stdout, stdin) {
    deferred.resolve(!!JSON.parse(stdout).message);
  });

  return deferred.promise;
}

// runs git clone and returns a promise
function cloneRepo(giturl, user, SSE) {
  mkpath.sync(__dirname + REPO_DIR + user + '/');

  var cd = 'cd ' + __dirname + REPO_DIR + user + '/; '; 
  var clone = 'git clone ' + giturl + ' --progress';

  SSE.write('>> ' + clone.replace(' --progress', ''));

  return execShellCommand(cd + clone, SSE);
}

/////// PUBLIC ///////

module.exports = {
  privateRepo: privateRepo,
  cloneRepo: cloneRepo
};
