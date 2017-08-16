//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config'),
      Log = require('@log');

//////////// PRIVATE ////////////

// initialize the repo object
function processRequestParams(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '1. Processing Request Params');

    let { owner, name, branch, username, password } = ctrl.params;

    //// 1. repo object ////
    if (!owner || !name)
      reject({ errorType: config.errorTypes.needOwnerAndName });

    ctrl.repo = {
      owner:    owner,
      name:     name,
      branch:   branch || '',
      fullName: owner + '/' + name,
      fNameBr:  owner + '/' + name + (branch ? '::' + branch : '')
    };

    //// 2. credentals ////
    ctrl.creds = {
      username: username && username.replace(/@/g, '%40'),
      password: password && password.replace(/@/g, '%40')
    };

    //// 3. folderName ////
    ctrl.folderName = config.repoToFolder(ctrl.repo.fullName, ctrl.uid);

    Log(1, 'NEW REPO: ' + ctrl.folderName);
    resolve(ctrl);
  });
}

//////////// EXPORTS /////////////

module.exports = processRequestParams;

