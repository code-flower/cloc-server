//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      Log = require('@log');

//////////// PRIVATE ////////////

function closeConnectionToClient(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '8. Closing Connection To Client');
    ctrl.conn.close();
    resolve();
  });
}

//////////// EXPORTS //////////////

module.exports = closeConnectionToClient;

