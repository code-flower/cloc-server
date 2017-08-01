//////////////////// IMPORTS //////////////////////

var appConfig = require('../shared/appConfig.js');
var HTTP = require('./HTTP/');
var WS = require('./WS/');
var system = require('./system/');



////////////// CREATE THE HTTP SERVER /////////////
// this server handles static file requests, sample repos,
// and harvesting the json after repos are cloned

var httpServer = HTTP.createServer(function(request, response) {

  var urlInfo = HTTP.parseUrl(request.url);

  switch(urlInfo.pathname) {
    case appConfig.endpoints.harvest:
      HTTP.serveFlower(response, urlInfo.query.repo);
      break;
    case appConfig.endpoints.email:
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

wsServer.on('connection', function(conn) {
  var socket;

  conn.on('message', function (rawData) {
    var data = JSON.parse(rawData);

    switch(data.type) {
      case appConfig.messageTypes.clone:
        socket = new WS.WebSocket(conn);
        system.cloneFlower(data.repo, socket);
        break;
      case appConfig.messageTypes.abort:
        socket.close();
        break;
    }
  });
});



///////////////// START LISTENING ///////////////////

httpServer.listen(appConfig.ports.HTTP, function() {
  console.log(`HTTP server running at ${appConfig.protocol.HTTP}://${appConfig.hostName}:${appConfig.ports.HTTP}`);
  console.log(`Websockets server running at ${appConfig.protocol.WS}://${appConfig.hostName}:${appConfig.ports.WS}`);
});


