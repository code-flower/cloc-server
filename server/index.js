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
      connPool      = require('./util/connectionPool')(process.pid),
      serveResponse = require('./api/serveResponse'),
      webhookServer = require('./util/webhookServer');




/////////// A PROTOCOL-AGNOSTIC SERVER ////////////

function server(protocol, request, response) {
  serveResponse({
    connId:    connPool.addConn(),
    request:   request,
    parse:     protocol.parseRequest,
    responder: protocol.Responder(response)
  })
  .then(connPool.removeConn);
}




////////////////////// MAIN ////////////////////////

// create http and ws servers
let httpServer = HTTP.createServer(server.bind(null, HTTP)),
    wsServer   = WS.createServer(server.bind(null, WS), httpServer);

// start listening
let port = config.ports.HTTP;
httpServer.listen(port, () => {
  Log(1, `WS and HTTP servers started on port ${port}.`);
  if (process.send) process.send('ready');
});

// graceful restart handler
process.on('message', function(message) {
  let prepCommand = 'prep-for-shutdown';
  if (message.topic === prepCommand)
    httpServer.close(() => {
      process.send({
        type: prepCommand,
        data: { success: true }
      });
    });
});

// webhook server
let webhookPort = config.ports.webhook;
if (config.runWebhookServer)
  webhookServer.listen(webhookPort, () => {
    Log(1, `Webhook server running on port ${webhookPort}.`)
  });

