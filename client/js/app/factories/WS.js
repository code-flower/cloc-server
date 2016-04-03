/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('WS', function($rootScope, appConfig, state) {

  // initiates a clone on the backend,
  // monitors progress over a websockets connection,
  // and broadcasts to the subscribers

  return {

    cloneFlower: function(data, subscribers) {
      
      var socket = new WebSocket(`ws://${appConfig.hostName}:${appConfig.ports.WS}`);

      socket.onopen = function(event) {
        console.log("Websocket connection opening");
        console.log("sending:", data);
        socket.send(JSON.stringify({
          type: appConfig.messageTypes.clone,
          repo: data
        }));  
        state.cloning = true;
      };

      socket.onmessage = function(event) {

        // halt if the clone has been aborted
        if (!state.cloning) {
          socket.send(JSON.stringify({
            type: appConfig.messageTypes.abort
          }));
          console.log("socket closed");
          $rootScope.$broadcast('cloneAborted');
          return;
        }

        // otherwise handle the event
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
    }

  };
});