
/////////////////////// IMPORTS ////////////////////////

const config = require('@config'),
      serveClocData = require('./responses/cloc'),
      servePing = require('./responses/ping'),
      handleErrors = require('./handleErrors'),
      Promise = require('bluebird');

/////////////////////// PRIVATE ////////////////////////

function serveResponse({ connId, request, parse, responder }) {
  parse(request)
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
    .catch(err => handleErrors(err, responder));
}

/////////////////////// EXPORTS ////////////////////////

module.exports = serveResponse;

