
//////////// IMPORTS ////////////

const config = require('@config'),
      Promise = require('bluebird');

//////////// PRIVATE ////////////

function parseRequest(request) {
  return new Promise((resolve, reject) => {
    let reqInfo;
    try {
      reqInfo = JSON.parse(request);
    } catch(e) {
      reject(e);
    }
    resolve(reqInfo);
  });
}

//////////// PUBLIC /////////////

module.exports = parseRequest;