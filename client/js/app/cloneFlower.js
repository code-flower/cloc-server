/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('cloneFlower', function($rootScope, appConfig) {

  // initiates a clone on the backend,
  // monitors progress over a websockets connection,
  // and broadcasts to the subscribers

  return function cloneFlower(data, subscribers) {
    
    var source = new WebSocket(`ws://${appConfig.hostName}:${appConfig.ports.WS}`);

    source.onopen = function(event) {
      console.log("Websocket connection opening:", event);
      source.send(JSON.stringify(data));  
    };

    source.onmessage = function(event) {
      var data = JSON.parse(event.data);
      var types = appConfig.messageTypes;

      switch(data.type) {
        case types.text:
          subscribers.forEach(function(subscriber) {
            subscriber(data.text);
          });    
          break;
        case types.error:
          source.close();
          break;
        case types.credentials:
          source.close();
          $rootScope.$broadcast('needCredentials');
          break;
        case types.unauthorized:
          source.close();
          $rootScope.$broadcast('needCredentials', { 
            invalid: true 
          });
          break;
        case types.complete:
          source.close();
          $rootScope.$broadcast('flowerReady', { 
            repoName: data.repoName
          });
          break;
      }
    };

    source.onclose = function() {
      console.log("Websocket connection closed")
    };

    source.onerror = function() {
      console.error("Websocket connection error")
    };
  };

});