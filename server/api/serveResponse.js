
/////////////////////// IMPORTS ////////////////////////

const config = require('@config'),
      serveClocData = require('./endpoints/cloc'),
      servePing = require('./endpoints/ping'),
      handleErrors = require('./handleErrors'),
      Promise = require('bluebird');

/////////////////////// PRIVATE ////////////////////////

function serveResponse({ connId, request, parse, responder }) {
  return parse(request)
    .then(reqInfo => {
      switch(reqInfo.endpoint) {
        case config.endpoints.cloc:
          return serveClocData({
            resp:   responder,
            params: reqInfo.params,
            uid:    connId
          });
        case config.endpoints.ping:
          return servePing({
            resp: responder
          });
        default:
          return Promise.reject({
            ...config.errors.EndpointNotRecognized,
            endpoint: reqInfo.endpoint
          });
      }
    })
    .catch(err => handleErrors(err, responder))
    .then(() => Promise.resolve(connId));
}

/////////////////////// EXPORTS ////////////////////////

module.exports = serveResponse;

