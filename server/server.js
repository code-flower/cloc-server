/////////////////// IMPORTS ////////////////////

// npm
var http = require('http');
var url = require('url');
var ws = require('nodejs-websocket');

// app
var appConfig = require('../shared/appConfig.js');
var cloneFlower = require('./scripts/cloneFlower.js');
var WebSocket = require('./scripts/WebSocket.js');
var serveFlower = require('./scripts/serveFlower.js');
var serveSamples = require('./scripts/serveSamples.js');
var serveStaticFile = require('./scripts/staticFileServer.js');



////////////// START THE HTTP SERVER /////////////
// this server handles static file requests and
// harvesting the json after repos are cloned

http.createServer(function (request, response) {

  var urlInfo = url.parse(request.url, true);

  switch(urlInfo.pathname) {
    case appConfig.endpoints.harvest:
      serveFlower(response, urlInfo.query.repo);
      break;
    case appConfig.endpoints.samples:
      serveSamples(response);
      break;
    default:
      serveStaticFile(response, urlInfo.pathname);
      break;
  }

}).listen(appConfig.ports.HTTP);

console.log(`HTTP server running at http://${appConfig.hostName}:${appConfig.ports.HTTP}`);



/////////// START THE WEBSOCKETS SERVER ///////////
// this server handles clone requests and broadcasts
// the server events to the client

ws.createServer(function(conn) {

  conn.on('text', function (data) {
    var socket = new WebSocket(conn),
        repo = JSON.parse(data);
    cloneFlower(socket, repo);
  });

}).listen(appConfig.ports.WS);

console.log(`Websockets server running at ws://${appConfig.hostName}:${appConfig.ports.WS}`);

