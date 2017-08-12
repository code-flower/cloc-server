//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

function convertClocFileToJson(repo) {
  return new Promise((resolve, reject) => {
    console.log("5. Converting Cloc File To Json");

    resolve(repo);
  });
}

//////////// EXPORTS //////////////

module.exports = convertClocFileToJson;