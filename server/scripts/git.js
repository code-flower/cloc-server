/////// IMPORTS ///////

var exec = require('child_process').exec;
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');
var Q = require('q');
var appConfig = require('../../shared/appConfig.js');

//////// PRIVATE /////

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
  socket.write('>> ' + curl);

  exec(curl, function(error, stdout, stdin) {
    var isPrivate = !!JSON.parse(stdout).message;
    deferred.resolve(isPrivate);
  });

  return deferred.promise;
}

// runs git clone and returns a promise
function cloneRepo(repo, socket) {
  var deferred = Q.defer();

  var dirName = repo.fullName.replace('/', '#');

  mkpath.sync(appConfig.paths.repos + dirName);

  var cd = 'cd ' + appConfig.paths.repos + dirName + '/; '; 
  var clone = `git clone ${gitCloneUrl(repo)} ${dirName} --progress`;

  socket.write('');
  socket.write('>> ' + clone.replace(' --progress', ''));

  var process = exec(cd + clone, function() { deferred.resolve(); });

  // listen for command output
  process.stdout.on('data', function(data) { socket.write(data); });

  process.stderr.on('data', function(data) { 
    socket.write(data); 
    if (data.match(/Invalid username or password/) ||
        data.match(/unable to access/)) 
      deferred.reject(appConfig.messageTypes.unauthorized);
  });

  return deferred.promise;
}

/////// PUBLIC ///////

module.exports = {
  checkPrivateRepo: checkPrivateRepo,
  cloneRepo: cloneRepo
};

/////// TESTING /////////

console.log(gitCloneUrl({
  url: 'https://dustlandmedia.git.beanstalkapp.com/roofshootserver.git',
  private: true,
  username: 'jake',
  password: 's0meP@ssword2257'
}));
