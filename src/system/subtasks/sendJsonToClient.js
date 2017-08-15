//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

function sendJsonToClient(repo) {
  return new Promise((resolve, reject) => {
    console.log("6. Sending Json To Client");

    repo.conn.success(repo);
    resolve(repo);
  });
}

//////////// EXPORTS ////////////

module.exports = sendJsonToClient;