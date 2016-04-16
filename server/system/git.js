//////////// IMPORTS ////////////

var exec = require('child_process').exec;
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');
var deleteRepo = require('./delete.js');

//////////// PRIVATE ////////////

// turns a repo object into a git clone url
function gitCloneUrl(repo) {
  if (!repo.private)
    return repo.url;
  else {
    var username = repo.username.replace(/@/g, '%40');
    var password = repo.password.replace(/@/g, '%40');
    return repo.url.replace('://', `://${username}:${password}@`);
  }
}

// returns a promise with data === true if repo is private, otherwise false
function checkPrivateRepo(repo, socket) {
  var deferred = Q.defer();

  var curl = `curl https://api.github.com/repos/${repo.fullName}`;
  socket.text('>> ' + curl);

  exec(curl, function(error, stdout, stdin) {
    var isPrivate = !!JSON.parse(stdout).message;
    deferred.resolve(isPrivate);
  });

  return deferred.promise;
}

// runs git clone and returns a promise
function cloneRepo(repo, socket) {
  var deferred = Q.defer();

  var dirName = appConfig.repoToFolder(repo.fullName);

  mkpath.sync(appConfig.paths.repos + dirName);

  var cd = `cd ${appConfig.paths.repos}${dirName}/; `; 
  var clone = `git clone ${gitCloneUrl(repo)} ${dirName} --progress`;

  socket.text('\n>> ' + clone.replace(' --progress', ''));

  var process = exec(cd + clone, deferred.resolve);

  // listen for command output
  process.stdout.on('data', function(data) { socket.text(data); });

  process.stderr.on('data', function(data) { 
    socket.text(data); 
    if (data.match(/Invalid username or password/) ||
        data.match(/unable to access/) ||
        data.match(/Unauthorized/)) 
      deferred.reject(appConfig.messageTypes.unauthorized);
  });

  return deferred.promise;
}

//////////// EXPORTS ////////////

module.exports = {
  checkPrivateRepo: checkPrivateRepo,
  cloneRepo: cloneRepo
};

