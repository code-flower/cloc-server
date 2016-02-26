/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('cloneFlower', function($rootScope, appConfig) {

  // initiates a clone on the backend,
  // monitors progress over a websockets connection,
  // and broadcasts to the subscribers

  return function cloneFlower(data, subscribers) {
    
    var socket = new WebSocket(`ws://${appConfig.hostName}:${appConfig.ports.WS}`);

    socket.onopen = function(event) {
      console.log("Websocket connection opening:", event);
      socket.send(JSON.stringify(data));  
    };

    socket.onmessage = function(event) {
      var data = JSON.parse(event.data);
      var types = appConfig.messageTypes;

      switch(data.type) {
        case types.text:
          subscribers.forEach(function(subscriber) {
            subscriber(data.text);
          });    
          break;
        case types.error:
          socket.close();
          break;
        case types.credentials:
          socket.close();
          console.log("DATA = ", data);
          $rootScope.$broadcast('needCredentials', {
            needHTTPS: data.needHTTPS
          });
          break;
        case types.unauthorized:
          socket.close();
          $rootScope.$broadcast('needCredentials', { 
            invalid: true 
          });
          break;
        case types.complete:
          socket.close();
          $rootScope.$broadcast('flowerReady', { 
            repoName: data.repoName
          });
          break;
      }
    };

    socket.onclose = function() {
      console.log("Websocket connection closed")
    };

    socket.onerror = function() {
      console.error("Websocket connection error")
    };
  };

});