//////////// IMPORTS ////////////

const { exec } = require('child_process'),
      mkpath = require('mkpath'),
      Promise = require('bluebird'),
      config = require('@config'),
      Log = require('@log'),
      Probe = require('pmx').probe();

//////////// METRICS ////////////

const cloneDownloadSpeed = Probe.metric({
  name: 'cloneDownloadSpeed'
});
cloneDownloadSpeed.set('');

//////////// PRIVATE ////////////

// turns a repo object into a git clone url
function gitCloneUrl(repo, creds) {
  let url = `https://github.com/${repo.fullName}.git`;
  if (creds.username && creds.password)
    url = url.replace('://', `://${creds.username}:${creds.password}@`);
  return url;
}

// updates the pmx probe for download speed
function updateDownloadSpeed(cloneOutput) {
  let match = cloneOutput.match(/Receiving\sobjects:\s100%.*?\|\s(.*?),\sdone/);
  if (match)
    cloneDownloadSpeed.set(match[1]);
}

// runs git clone and returns a promise
function cloneRepoInFilesystem(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '3. Cloning Repo In Filesystem');

    mkpath(config.paths.repos + ctrl.folderName, err => {
      // it's okay if the error is that the tmp or repos folder already exists
      if (err && err.code !== 'EEXIST') {
        reject(err);
        return false;
      }

      let cloneUrl = gitCloneUrl(ctrl.repo, ctrl.creds),
          cd = `cd ${config.paths.repos}${ctrl.folderName}/; `, 
          clone = `git clone ${cloneUrl} --progress --single-branch` + 
                  (ctrl.repo.branch ? ` --branch ${ctrl.repo.branch}` : '');

      // replace username and password, if any, with asterisks, before sending to client
      let outText = clone.replace(/https:\/\/.*?@/, 'https://******:******@');
      ctrl.conn.update('\n>> ' + outText);

      // start clone
      let proc = exec(cd + clone, () => resolve(ctrl));

      // pipe output to socket
      // NOTE: git uses the stderr channel even for non-error states
      let cloneOutput = '';
      proc.stderr.on('data', data => { 
        ctrl.conn.update(data); 
        cloneOutput += data;
      });

      // update the download speed for the pmx monitor
      proc.stderr.on('end', () => updateDownloadSpeed(cloneOutput));
    });
  });
}

//////////// EXPORTS ////////////

module.exports = cloneRepoInFilesystem;

