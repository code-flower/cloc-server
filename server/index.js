/////////////////// IMPORTS //////////////////////

var appConfig = require('../shared/appConfig.js');
var HTTP = require('./HTTP/');
var WS = require('./WS/');
var system = require('./system/');



////////////// START THE HTTP SERVER /////////////
// this server handles static file requests and
// harvesting the json after repos are cloned

HTTP.createServer(function (request, response) {

  var urlInfo = HTTP.parseUrl(request.url);

  switch(urlInfo.pathname) {
    case appConfig.endpoints.harvest:
      HTTP.serveFlower(response, urlInfo.query.repo);
      break;
    case appConfig.endpoints.samples:
      HTTP.serveSamples(response);
      break;
    default:
      HTTP.serveStaticFile(response, urlInfo.pathname);
      break;
  }

}).listen(appConfig.ports.HTTP);

console.log(`HTTP server running at http://${appConfig.hostName}:${appConfig.ports.HTTP}`);



/////////// START THE WEBSOCKETS SERVER ///////////
// this server handles clone requests and broadcasts
// the server events to the client

WS.createServer(function(conn) {

  var socket;

  conn.on('text', function (rawData) {
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

}).listen(appConfig.ports.WS);

console.log(`Websockets server running at ws://${appConfig.hostName}:${appConfig.ports.WS}`);

