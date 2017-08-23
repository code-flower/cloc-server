////////// INITIALIZE 3RD-PARTY TOOLS ////////////

require('module-alias/register');

require('pmx').init({
  network: true,
  ports: true
});




//////////////////// IMPORTS //////////////////////

const config      = require('@config'),
      Log         = require('@log'),
      HTTP        = require('./HTTP/'),
      WS          = require('./WS/'),
      uid         = require('./util/uidGenerator')(process.pid);

const {
  serveClocData,
  servePing, 
  serveError
}                 = require('./responses');




//////////////////// FUNCTIONS ////////////////////

// A PROTOCOL-AGNOSTIC SERVER //
function genericServer(protocol, req, res) {
  let responder = protocol.Responder(res);

  protocol.parseRequest(req)
    .then(reqInfo => {
      switch(reqInfo.endpoint) {
        case config.endpoints.cloc:
          serveClocData({
            conn:   responder,
            params: reqInfo.params,
            uid:    uid()
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

// BIND THE GENERIC SERVER TO A PROTOCOL //
function createBoundServer(protocol, baseServer) {
  let server = genericServer.bind(null, protocol);
  return protocol.createServer(server, baseServer);
}




///////////// CREATE HTTP AND WS SERVERS //////////

const httpServer = createBoundServer(HTTP, null);
const wsServer   = createBoundServer(WS, httpServer);




//////////////// START LISTENING //////////////////

httpServer.listen(config.ports.HTTP, () => {
  Log(1, `Server started on port ${config.ports.HTTP}.`);
});



