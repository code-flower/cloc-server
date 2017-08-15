require('module-alias/register');

//////////////////// IMPORTS //////////////////////

var config = require('@config');
var HTTP = require('./HTTP/');
var WS = require('./WS/');
var system = require('./system/');
const uid = require('./util/uidGenerator')(process.pid);



////////////// CREATE THE HTTP SERVER /////////////

var httpServer = HTTP.createServer(function(request, response) {
  HTTP.parseRequest(request)
  .then(reqInfo => {
    switch(reqInfo.endpoint) {
      case config.endpoints.cloc:
        system.generateFlower({
          params: reqInfo.params,
          uid:    uid(),
          conn:   HTTP.Responder(response)
        });
        break;
    }
  });
});



/////////// CREATE THE WEBSOCKETS SERVER ///////////
// this server handles clone requests and broadcasts
// the server events to the client

var wsServer = new WS.createServer({server: httpServer});

wsServer.on('connection', conn => {
  conn.on('message', msg => {
    msg = JSON.parse(msg);
    switch(msg.type) {
      case config.endpoints.cloc:
        system.generateFlower({
          params: msg.data,
          uid:    uid(),
          conn:   WS.Responder(conn)
        });
        break;
    }
  });
});



///////////////// START LISTENING ///////////////////

// START BY USING MKPATH.SYNC TO CREATE NECESSARY FOLDERS

httpServer.listen(config.ports.HTTP, function() {
  console.log(`HTTP server running at port ${config.ports.HTTP} using protocol '${config.protocols.HTTP}'`);
  console.log(`Websockets server running at port ${config.ports.WS} using protocol '${config.protocols.WS}'`);
});




