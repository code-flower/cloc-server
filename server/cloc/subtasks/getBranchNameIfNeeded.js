// get the name of the branch if the client hasn't provided one

//////////// IMPORTS ////////////

const fs = require('fs'),
      config = require('@config'),
      Log = require('@log');

//////////// PRIVATE ////////////

function getBranchNameIfNeeded(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '4. Getting Branch Name');

    // if the client provided a branch name, move on
    if (ctrl.repo.branch) {
      resolve(ctrl);

    // otherwise, read the names of the files in the
    // .git/refs/heads/ directory for the given repo.
    // Since we used the --single-branch flag to clone,
    // there is only one name -- the name of the default branch.
    } else {   
      let dir = config.paths.repos + 
                ctrl.folderName + '/' + 
                ctrl.repo.name + '/' + 
                '.git/refs/heads/';
      fs.readdir(dir, (err, files) => {
        if (files)
          ctrl.repo.branch = files[0];
        resolve(ctrl);
      }); 
    }
  });
}

//////////// EXPORTS ////////////

module.exports = getBranchNameIfNeeded;