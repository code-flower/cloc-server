////////////////////// IMPORTS /////////////////////////

const ws = require('ws');

/////////////// CONSTRUCT CREATESERVER /////////////////

function createServer(server, httpServer) {
  let wsServer = new ws.Server({server: httpServer});
  wsServer.on('connection', conn => {
    conn.on('message', req => {
      server(req, conn);
    });
  });
}

////////////////////// EXPORTS /////////////////////////

module.exports = createServer;