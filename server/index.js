require('module-alias/register');

//////////////////// IMPORTS //////////////////////

const config      = require('@config'),
      HTTP        = require('./HTTP/'),
      WS          = require('./WS/'),
      getClocData = require('./cloc/'),
      uid         = require('./util/uidGenerator')(process.pid);



////////////// CREATE THE HTTP SERVER /////////////

const httpServer = HTTP.createServer(function(request, response) {
  HTTP.parseRequest(request)
  .then(reqInfo => {
    switch(reqInfo.endpoint) {
      case config.endpoints.cloc:
        getClocData({
          params: reqInfo.params,
          uid:    uid(),
          conn:   HTTP.Responder(response)
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

httpServer.listen(config.ports.HTTP, function() {
  console.log(`HTTP server running at port ${config.ports.HTTP} using protocol '${config.protocols.HTTP}'`);
  console.log(`Websockets server running at port ${config.ports.WS} using protocol '${config.protocols.WS}'`);
});




