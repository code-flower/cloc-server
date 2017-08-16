//////////// IMPORTS ////////////

const { exec } = require('child_process'),
      mkpath = require('mkpath'),
      Promise = require('bluebird'),
      config = require('@config'),
      Log = require('@log');

//////////// PRIVATE ////////////

// turns a repo object into a git clone url
function gitCloneUrl(repo, creds) {
  let url = `https://github.com/${repo.fullName}.git`;
  if (creds.username && creds.password)
    url = url.replace('://', `://${creds.username}:${creds.password}@`);
  return url;
}

// runs git clone and returns a promise
function cloneRepoInFilesystem(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '3. Cloning Repo In Filesystem');

    mkpath(config.paths.repos + ctrl.folderName, err => {
      if (err) {
        reject({
          errorType: config.errorTypes.mkpathError,
          errorData: err
        });
        return false;
      }

      let cloneUrl = gitCloneUrl(ctrl.repo, ctrl.creds),
          cd = `cd ${config.paths.repos}${ctrl.folderName}/; `, 
          clone = `git clone ${cloneUrl} --progress --single-branch` + 
                  (ctrl.repo.branch ? ` --branch ${ctrl.repo.branch}` : '');

      // replace username and password, if any, with asterisks, before sending to client
      var outText = clone.replace(/https:\/\/.*?@/, 'https://******:******@');
      ctrl.conn.update('\n>> ' + outText);

      // start clone
      var proc = exec(cd + clone, () => resolve(ctrl));

      // pipe output to socket
      // NOTE: git uses the stderr channel even for non-error states
      proc.stderr.on('data', data => { ctrl.conn.update(data); });
    });
  });
}

//////////// EXPORTS ////////////

module.exports = cloneRepoInFilesystem;

