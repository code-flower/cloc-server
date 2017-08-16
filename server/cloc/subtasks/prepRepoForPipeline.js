//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config'),
      Log = require('@log');

//////////// PRIVATE ////////////

// initialize the repo object
function prepRepoForPipeline(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '1. Prepping Repo For Pipeline');

    let { owner, name, branch, username, password } = ctrl.params;

    //// 1. repo object ////
    
    if (!owner || !name)
      reject({ errorType: config.errorTypes.needOwnerAndName });

    ctrl.repo = {
      owner,
      name,
      branch: branch || '',
      fullName: `${owner}/${name}`
    };

    Log(1, 'NEW REPO: ' + ctrl.repo.fullName + (branch ? '::' + branch : ''));

    //// 2. credentals ////

    ctrl.creds = {
      username: username && username.replace(/@/g, '%40'),
      password: password && password.replace(/@/g, '%40')
    };

    //// 3. folderName ////

    ctrl.folderName = config.repoToFolder(ctrl.repo.fullName, ctrl.uid);

    resolve(ctrl);
  });
}

//////////// EXPORTS /////////////

module.exports = prepRepoForPipeline;

