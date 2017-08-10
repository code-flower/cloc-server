//////////// IMPORTS ////////////

const Promise = require('bluebird');

//////////// PRIVATE ////////////

// initialize the repo object
function prepRepo(repo) {
  return new Promise((resolve, reject) => {
    repo.fullName = `${repo.owner}/${repo.name}`; 
    resolve(repo);
  });
}

//////////// EXPORTS /////////////

module.exports = prepRepo;
