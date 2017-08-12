require('module-alias/register');

//////////////////// IMPORTS //////////////////////

var config = require('@config');
var HTTP = require('./HTTP/');
var WS = require('./WS/');
var system = require('./system/');



////////////// CREATE THE HTTP SERVER /////////////
// this server handles static file requests, sample repos,
// and harvesting the json after repos are cloned

var httpServer = HTTP.createServer(function(request, response) {

  var urlInfo = HTTP.parseUrl(request.url);

  switch(urlInfo.pathname) {
    case config.endpoints.harvest:
      HTTP.serveFlower(response, urlInfo.query.repo);
      break;
    case config.endpoints.email:
      HTTP.sendEmail(response, urlInfo.query.message);
      break;
    default:
      HTTP.serveStaticFile(request, response, urlInfo.pathname);
      break;
  }

});



/////////// CREATE THE WEBSOCKETS SERVER ///////////
// this server handles clone requests and broadcasts
// the server events to the client

var wsServer = new WS.createServer({server: httpServer});
var connId = 0;

wsServer.on('connection', function(conn) {
  // increment the connId so that each connection is unique
  conn.uid = connId;
  connId = (connId + 1) % (2 << 12);

  var socket;
  conn.on('message', function(msg) {
    msg = JSON.parse(msg);

    switch(msg.type) {

      // CLONE
      case config.messageTypes.clone:
        socket = new WS.WebSocket(conn);

        msg.repo.uid = process.pid + '_' + conn.uid,
        msg.repo.socket = socket;

        system.generateFlower(msg.repo);
        break;

      // ABORT
      case config.messageTypes.abort:
        socket.close();
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




