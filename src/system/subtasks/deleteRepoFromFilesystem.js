//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      rimraf = require('rimraf'),
      config = require('@config');

//////////// PRIVATE ////////////

function deleteRepoFromFilesystem(ctrl) {
  return new Promise((resolve, reject) => {
    console.log("7. Deleting Repo From Filesystem");

    if (!config.deleteAfterClone)
      resolve(ctrl);
    else
      rimraf(config.paths.repos + ctrl.folderName, () => resolve(ctrl));
  });
}

//////////// EXPORTS ////////////

module.exports = deleteRepoFromFilesystem;