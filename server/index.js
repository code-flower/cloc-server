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
      getClocData = require('./cloc/'),
      uid         = require('./util/uidGenerator')(process.pid);




////////////// CREATE THE HTTP SERVER /////////////

const httpServer = HTTP.createServer((req, res) => {
  HTTP.parseRequest(req)
  .then(reqInfo => {
    switch(reqInfo.endpoint) {
      case config.endpoints.cloc:
        getClocData({
          params: reqInfo.params,
          uid:    uid(),
          conn:   HTTP.Responder(res)
        });
        break;
    }
  });
});




/////////// CREATE THE WEBSOCKETS SERVER ///////////

const wsServer = new WS.createServer({server: httpServer});

wsServer.on('connection', conn => {
  conn.on('message', msg => {
    msg = JSON.parse(msg);
    switch(msg.type) {
      case config.endpoints.cloc:
        getClocData({
          params: msg.data,
          uid:    uid(),
          conn:   WS.Responder(conn)
        });
        break;
    }
  });
});




///////////////// START LISTENING ///////////////////

httpServer.listen(config.ports.HTTP, () => {
  Log(1, `Server started on port ${config.ports.HTTP}.`);
});




