//////////// IMPORTS ////////////

const { exec } = require('child_process'),
      mkpath = require('mkpath'),
      Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

// turns a repo object into a git clone url
function gitCloneUrl(repo) {
  let url = `https://github.com/${repo.fullName}.git`;
  if (repo.username && repo.password)
    url = url.replace('://', `://${repo.username}:${repo.password}@`);
  return url;
}

// runs git clone and returns a promise
function cloneRepoInFilesystem(repo) {
  return new Promise((resolve, reject) => {
    console.log("3. Cloning Repo In Filesystem");

    mkpath(config.paths.repos + repo.folderName, err => {
      if (err) {
        reject({
          errorType: config.errorTypes.mkpathError,
          errorData: err
        });
        return false;
      }

      var cd = `cd ${config.paths.repos}${repo.folderName}/; `; 
      var clone = `git clone ${gitCloneUrl(repo)} --progress --single-branch` + 
                  (repo.branch ? ` --branch ${repo.branch}` : '');

      // replace username and password, if any, with asterisks, before sending to client
      var outText = clone.replace(/https:\/\/.*?@/, 'https://******:******@');
      repo.conn.update('\n>> ' + outText);

      // start clone
      var proc = exec(cd + clone, () => resolve(repo));

      // pipe output to socket
      // NOTE: git uses the stderr channel even for non-error states
      proc.stderr.on('data', data => { repo.conn.update(data); });
    });
  });
}

//////////// EXPORTS ////////////

module.exports = cloneRepoInFilesystem;

