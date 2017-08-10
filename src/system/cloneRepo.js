//////////// IMPORTS ////////////

var exec = require('child_process').exec;
var mkpath = require('mkpath');
var config = require('../../config');

//////////// PRIVATE ////////////

// turns a repo object into a git clone url
function gitCloneUrl(repo) {
  let url = `https://github.com/${repo.fullName}.git`;
  if (repo.username && repo.password)
    url = url.replace('://', `://${repo.username}:${repo.password}@`);
  return url;
}

// runs git clone and returns a promise
function cloneRepo(repo) {
  return new Promise((resolve, reject) => {
    console.log("CLONING:", repo.fullName);

    mkpath(config.paths.repos + repo.folderName, function(err) {
      if (err) {
        reject(err);
        return false;
      }

      var cd = `cd ${config.paths.repos}${repo.folderName}/; `; 
      var clone = `git clone ${gitCloneUrl(repo)} --progress --single-branch` + 
                  (repo.branch ? ` --branch ${repo.branch}` : '');

      // replace username and password, if any, with asterisks, before sending to client
      var socketText = clone.replace(/https:\/\/.*?@/, 'https://******:******@');
      repo.socket.text('\n>> ' + socketText);

      // start clone
      var proc = exec(cd + clone, () => resolve(repo));

      // pipe output to socket
      proc.stderr.on('data', data => { repo.socket.text(data); });
    });
  });
}

//////////// EXPORTS ////////////

module.exports = cloneRepo;

