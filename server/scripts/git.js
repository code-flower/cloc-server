/////// IMPORTS ///////

var exec = require('child_process').exec;
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');

//////// PRIVATE /////

// returns a promise with data === true if repo is private, otherwise false
function checkPrivateRepo(user, repo, socket) {
  var deferred = Q.defer();

  var curl = 'curl https://api.github.com/repos/' + user + '/' + repo;
  socket.write('>> ' + curl);

  exec(curl, function(error, stdout, stdin) {
    var isPrivate = !!JSON.parse(stdout).message;
    deferred.resolve(isPrivate);
  });

  return deferred.promise;
}

// runs git clone and returns a promise
function cloneRepo(giturl, user, socket) {
  console.log("CLONING REPO");

  var deferred = Q.defer();

  mkpath.sync(appConfig.paths.repos + user + '/');

  var cd = 'cd ' + appConfig.paths.repos + user + '/; '; 
  var clone = 'git clone ' + giturl + ' --progress';

  socket.write('');
  socket.write('>> ' + clone.replace(' --progress', ''));

  var process = exec(cd + clone, function() { deferred.resolve(); });

  // listen for command output
  process.stdout.on('data', function(data) { socket.write(data); });

  process.stderr.on('data', function(data) { 
    socket.write(data); 
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
