//////////// IMPORTS ////////////

const Promise = require('bluebird');

//////////// PRIVATE ////////////

function closeConnectionToClient(repo) {
  return new Promise((resolve, reject) => {
    console.log("8. Closing Connection To Client");
    repo.socket.close();
    resolve();
  });
}

//////////// EXPORTS //////////////

module.exports = closeConnectionToClient;

