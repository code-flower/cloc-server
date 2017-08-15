//////////// IMPORTS ////////////

const Promise = require('bluebird');

//////////// PRIVATE ////////////

function closeConnectionToClient(ctrl) {
  return new Promise((resolve, reject) => {
    console.log("8. Closing Connection To Client");
    ctrl.conn.close();
    resolve();
  });
}

//////////// EXPORTS //////////////

module.exports = closeConnectionToClient;

