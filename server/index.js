////////// INITIALIZE 3RD-PARTY TOOLS ////////////

require('module-alias/register');

require('pmx').init({
  network: true,
  ports: true
});




//////////////////// IMPORTS //////////////////////

const config        = require('@config'),
      Log           = require('@log'),
      HTTP          = require('./HTTP/'),
      WS            = require('./WS/'),
      serveClocData = require('./cloc/'),
      uid           = require('./util/uidGenerator')(process.pid);




//////////////////// FUNCTIONS ////////////////////

// A PROTOCOL-AGNOSTIC CLOC SERVER //
function genericServer(protocol, req, res) {
  let responder = protocol.Responder(res);

  let serveError = (err) => {
    Log(1, 'ERROR: ' + err.name);
    responder.error(err);
    responder.close();
  };

  protocol.parseRequest(req)
    .then(reqInfo => {
      switch(reqInfo.endpoint) {
        case config.endpoints.cloc:
          serveClocData({
            params: reqInfo.params,
            uid:    uid(),
            conn:   responder
          });
          break;
        default:
          serveError(config.errors.EndpointNotRecognized);
          break;
      }
    })
    .catch(err => serveError(config.errors.ParseError));
}

// BIND THE GENERIC SERVER TO A PROTOCOL //
function createBoundServer(protocol, baseServer) {
  return protocol.createServer(genericServer.bind(null, protocol), baseServer);
}




///////////// CREATE HTTP AND WS SERVERS //////////

const httpServer = createBoundServer(HTTP, null);
const wsServer   = createBoundServer(WS, httpServer);




//////////////// START LISTENING //////////////////

httpServer.listen(config.ports.HTTP, () => {
  Log(1, `Server started on port ${config.ports.HTTP}.`);
});



