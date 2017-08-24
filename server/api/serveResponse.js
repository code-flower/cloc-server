
/////////////////////// IMPORTS ////////////////////////

const config = require('@config');

const {
  serveClocData,
  servePing, 
  serveError
} = require('./responses');

/////////////////////// PRIVATE ////////////////////////

function serveResponse({ connId, request, parse, responder }) {
  parse(request)
    .then(reqInfo => {
      switch(reqInfo.endpoint) {
        case config.endpoints.cloc:
          serveClocData({
            resp:   responder,
            params: reqInfo.params,
            uid:    connId
          });
          break;
        case config.endpoints.ping:
          servePing({
            resp: responder
          });
          break;
        default:
          serveError({
            resp: responder, 
            err:  config.errors.EndpointNotRecognized
          });
          break;
      }
    })
    .catch(err => serveError({
      resp: responder, 
      err:  config.errors.ParseError
    }));
}

/////////////////////// EXPORTS ////////////////////////

module.exports = serveResponse;

