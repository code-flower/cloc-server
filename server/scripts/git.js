
var mkpath = require('mkpath');
var execShellCommand = require('./shell.js');

var REPO_DIR = '/../repos/';

// runs git clone
function cloneRepo(giturl, user, SSE) {
  mkpath.sync(__dirname + REPO_DIR + user + '/');

  var cd = 'cd ' + __dirname + REPO_DIR + user + '/; '; 
  var clone = 'git clone ' + giturl + ' --progress';

  SSE.write('>> ' + clone.replace(' --progress', ''));

  return execShellCommand(cd + clone, SSE);
}

module.exports = {
  cloneRepo: cloneRepo
};