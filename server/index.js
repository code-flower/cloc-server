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
      serveResponse = require('./api/serveResponse');




/////////// A PROTOCOL-AGNOSTIC SERVER ////////////

function server(protocol, request, response) {
  let connId  = connPool.addConn(),
      onClose = connPool.removeConn.bind(null, connId);

  serveResponse({
    connId:     connId,
    request:    request,
    parse:      protocol.parseRequest,
    responder:  protocol.Responder(response, onClose)
  });
}




////////////////////// MAIN ////////////////////////

// create http and ws servers
let httpServer = HTTP.createServer(server.bind(null, HTTP)),
    wsServer   = WS.createServer(server.bind(null, WS), httpServer);

// start listening
let port = config.ports.HTTP;
httpServer.listen(port, () => {
  Log(1, `Servers started on port ${port}.`);

  // if pm2 is running, let it know we're ready
  if (process.send)
    process.send('ready');
});

//graceful reload handler
process.on('message', function(message) {
  console.log("Received reload request:", message);
  if (message.topic === 'graceful-reload') {
    httpServer.close(() => {
      process.send({
        type: 'reloaded',
        data: { success : true }
      });
    });
  }
});
