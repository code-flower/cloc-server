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
    console.log("error:", error);
    console.log("stdout:", stdout);
    console.log("stdin:", stdin);
    var isPrivate = !!JSON.parse(stdout).message;
    deferred.resolve(isPrivate);
  });

  return deferred.promise;
}

// runs git clone and returns a promise
function cloneRepo(giturl, user, SSE) {
  console.log("CLONING REPO");

  var deferred = Q.defer();

  mkpath.sync(__dirname + REPO_DIR + user + '/');

  var cd = 'cd ' + __dirname + REPO_DIR + user + '/; '; 
  var clone = 'git clone ' + giturl + ' --progress';

  SSE.write('');
  SSE.write('>> ' + clone.replace(' --progress', ''));

  var process = exec(cd + clone, function() { deferred.resolve(); });

  // listen for command output
  process.stdout.on('data', function(data) { SSE.write(data); });

  process.stderr.on('data', function(data) { 
    SSE.write(data); 
    if (data.match(/Invalid username or password/) ||
        data.match(/unable to access/)) 
      deferred.reject('unauthorized');
  });

  return deferred.promise;
}

/////// PUBLIC ///////

module.exports = {
  checkPrivateRepo: checkPrivateRepo,
  cloneRepo: cloneRepo
};
