/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('cloneFlower', function($rootScope, appConfig, state) {

  // initiates a clone on the backend,
  // monitors progress over a websockets connection,
  // and broadcasts to the subscribers

  return function cloneFlower(data, subscribers) {
    
    var socket = new WebSocket(`ws://${appConfig.hostName}:${appConfig.ports.WS}`);

    socket.onopen = function(event) {
      console.log("data:", data);
      console.log("Websocket connection opening:", event);
      socket.send(JSON.stringify({
        type: 'open',
        repo: data
      }));  
      state.cloning = true;
    };

    socket.onmessage = function(event) {
      var data = JSON.parse(event.data);
      var types = appConfig.messageTypes;

      console.log("state", state);

      if (!state.cloning) {
        // MAY NEED TO SEND CLOSING MESSAGE TO SERVER
        socket.send(JSON.stringify({
          type: 'close'
        }));
        console.log("socket closed");
        $rootScope.$broadcast('cloneAborted');
        return;
      }

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