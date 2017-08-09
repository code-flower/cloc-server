//////////// IMPORTS ////////////

var exec = require('child_process').exec;
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var Q = require('q');
var config = require('../../config');
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

  var lsRemote = `git ls-remote -h "https://github.com/${repo.fullName}"`;
  socket.text('>> ' + lsRemote);

  var proc = exec(lsRemote, () => deferred.resolve(false));

  // listen for command output
  proc.stdout.on('data', function(data) { socket.text(data); });

  proc.stderr.on('data', function(data) { 
    socket.text(data); 

    data = data.toString('utf-8');
    if (data.match(/Repository not found/) ||
        data.match(/fatal:/)) 
      deferred.resolve(true);
  });

  return deferred.promise;
}

// runs git clone and returns a promise
function cloneRepo(repo, socket) {
  console.log("CLONING:", repo.folderName);

  var deferred = Q.defer();

  var dirName = repo.folderName;

  mkpath.sync(config.paths.repos + dirName);

  var cd = `cd ${config.paths.repos}${dirName}/; `; 
  var clone = `git clone ${gitCloneUrl(repo)} ${dirName} --progress`;

  // replace username and password, if any, with asterisks, before sending to client
  var socketText = clone.replace(/https:\/\/.*?@/, 'https://******:******@');
  socket.text('\n>> ' + socketText);

  var proc = exec(cd + clone, deferred.resolve);

  // listen for command output
  proc.stdout.on('data', function(data) { socket.text(data); });

  proc.stderr.on('data', function(data) { 
    socket.text(data); 

    data = data.toString('utf-8');
    if (data.match(/Invalid username or password/) ||
        data.match(/unable to access/) ||
        data.match(/Unauthorized/)) 
      deferred.reject(config.messageTypes.unauthorized);
  });

  return deferred.promise;
}

//////////// EXPORTS ////////////

module.exports = {
  checkPrivateRepo: checkPrivateRepo,
  cloneRepo: cloneRepo
};

