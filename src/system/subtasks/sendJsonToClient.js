//////////// IMPORTS ////////////

const Promise = require('bluebird'),
      config = require('@config');

//////////// PRIVATE ////////////

function sendJsonToClient(ctrl) {
  return new Promise((resolve, reject) => {
    console.log("6. Sending Json To Client");

    ctrl.conn.success(ctrl.repo);
    resolve(ctrl);
  });
}

//////////// EXPORTS ////////////

module.exports = sendJsonToClient;