//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

// initialize the repo object
function prepRepoForPipeline(repo) {
  return new Promise((resolve, reject) => {
    console.log("1. Prepping Repo For Pipeline");

    repo.fullName = `${repo.owner}/${repo.name}`; 
    repo.folderName = config.repoToFolder(repo.fullName, repo.uid);
    if (repo.username)
      repo.username = repo.username.replace(/@/g, '%40');
    if (repo.password)
      repo.password = repo.password.replace(/@/g, '%40');
    
    resolve(repo);
  });
}

//////////// EXPORTS /////////////

module.exports = prepRepoForPipeline;
