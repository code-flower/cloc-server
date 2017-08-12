//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      rimraf = require('rimraf'),
      config = require('@config');

//////////// PRIVATE ////////////

function deleteRepoFromFilesystem(repo) {
  return new Promise((resolve, reject) => {
    console.log("7. Deleting Repo From Filesystem");

    if (!config.deleteAfterClone)
      resolve(repo);
    else
      rimraf(config.paths.repos + repo.folderName, () => resolve(repo));
  });
}

//////////// EXPORTS ////////////

module.exports = deleteRepoFromFilesystem;