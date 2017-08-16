//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config'),
      Log = require('@log');

//////////// PRIVATE ////////////

function sendJsonToClient(ctrl) {
  return new Promise((resolve, reject) => {
    Log(2, '6. Sending Json To Client');

    ctrl.conn.success(ctrl.repo);
    resolve(ctrl);
  });
}

//////////// EXPORTS ////////////

module.exports = sendJsonToClient;