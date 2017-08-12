//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

function deleteRepoFromFilesystem(repo) {
  return new Promise((resolve, reject) => {
    console.log("7. Deleting Repo From Filesystem");

    resolve(repo);
  });
}

//////////// EXPORTS ////////////

module.exports = deleteRepoFromFilesystem;