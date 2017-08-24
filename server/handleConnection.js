
/////////////////////// IMPORTS ////////////////////////

const config = require('@config');

const {
  serveClocData,
  servePing, 
  serveError
} = require('./responses');

/////////////////////// PRIVATE ////////////////////////

function handleConnection(conn) {
  let { connId, request, parse, responder } = conn;

  parse(request)
    .then(reqInfo => {
      switch(reqInfo.endpoint) {
        case config.endpoints.cloc:
          serveClocData({
            conn:   responder,
            params: reqInfo.params,
            uid:    connId
          });
          break;
        case config.endpoints.ping:
          servePing({
            conn: responder
          });
          break;
        default:
          serveError({
            conn: responder, 
            err:  config.errors.EndpointNotRecognized
          });
          break;
      }
    })
    .catch(err => serveError({
      conn: responder, 
      err:  config.errors.ParseError
    }));
}

/////////////////////// EXPORTS ////////////////////////

module.exports = handleConnection;

