//////////// IMPORTS ////////////

const Promise = require('bluebird');

//////////// PRIVATE ////////////

function closeConnectionToClient(repo) {
  return new Promise((resolve, reject) => {
    console.log("8. Closing Connection To Client");
    repo.conn.close();
    resolve();
  });
}

//////////// EXPORTS //////////////

module.exports = closeConnectionToClient;

