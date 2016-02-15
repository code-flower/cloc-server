/////// IMPORTS ///////

var exec = require('child_process').exec;
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var Q = require('q');

/////// CONSTANTS /////

var REPO_DIR = '/../repos/';

//////// PRIVATE /////

// returns a promise with data === true if repo is private, otherwise false
function checkPrivateRepo(user, repo, SSE) {
  var deferred = Q.defer();

  var curl = 'curl https://api.github.com/repos/' + user + '/' + repo;
  SSE.write('>> ' + curl);

  exec(curl, function(error, stdout, stdin) {
    var isPrivate = !!JSON.parse(stdout).message;
    deferred.resolve(isPrivate);
  });

  return deferred.promise;
}

// runs git clone and returns a promise
function cloneRepo(giturl, user, SSE) {
  mkpath.sync(__dirname + REPO_DIR + user + '/');

  var cd = 'cd ' + __dirname + REPO_DIR + user + '/; '; 
  var clone = 'git clone ' + giturl + ' --progress';

  SSE.write('');
  SSE.write('>> ' + clone.replace(' --progress', ''));

  return execShellCommand(cd + clone, SSE);
}

/////// PUBLIC ///////

module.exports = {
  checkPrivateRepo: checkPrivateRepo,
  cloneRepo: cloneRepo
};
