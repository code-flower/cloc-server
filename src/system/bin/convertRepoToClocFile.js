//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

function convertRepoToClocFile(repo) {
  return new Promise((resolve, reject) => {
    console.log("4. Converting Repo To Cloc File");

    resolve(repo);
  });
}

//////////// EXPORTS ////////////

module.exports = convertRepoToClocFile;