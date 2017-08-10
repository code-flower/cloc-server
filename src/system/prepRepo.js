//////////// IMPORTS ////////////

const Promise = require('bluebird');
const config = require('../../config');

//////////// PRIVATE ////////////

// initialize the repo object
function prepRepo(repo) {
  return new Promise((resolve, reject) => {
    repo.fullName = `${repo.owner}/${repo.name}`; 
    repo.folderName = config.repoToFolder(repo.fullName, repo.uid);
    if (repo.username)
      repo.username = repo.username.replace(/@/g, '%40');
    if (repo.password)
      repo.password = repo.password.replace(/@/g, '%40');

    // handle case where repo contains a 'url' or 'cloneUrl' prop
    // instead of owner/name

    resolve(repo);
  });
}

//////////// EXPORTS /////////////

module.exports = prepRepo;
