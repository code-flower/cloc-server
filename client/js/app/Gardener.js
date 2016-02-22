/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('Gardener', function($rootScope, $http, $q, dbAccess, appConfig) {

  //// PRIVATE ////

  // an array of callbacks to call when the
  // eventsource receives a message
  var subscribers = [];

  // gets a flower from the backend
  function getFlower(data) {
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
  }

  //// THE SERVICE ////

  return {

    // grow a flower from a git clone url
    clone: function(url, isPrivate) {
      getFlower({
        url: url,
        isPrivate: isPrivate || false
      });
    },

    update: function(repoName) {
      console.log("updating repo:", repoName);
    },

    // pluck a flower from the garden
    harvest: function(repoName) {
      var deferred = $q.defer();

      dbAccess.get(repoName)
      .then(function(data) {
        if (data)
          deferred.resolve(data);
        else {
          var url = `http://${appConfig.hostName}:${appConfig.ports.HTTP}` + 
                    `${appConfig.endpoints.harvest}?repo=${encodeURIComponent(repoName)}`;
          $http.get(url)
          .then(function(res) {
            dbAccess.set(repoName, res.data);
            deferred.resolve(res.data);
          });
        }
      })
      .catch(function(err) {
        console.log("db access error = ", err);
        deferred.reject(err);
      });

      return deferred.promise;
    },

    // list the flowers in the garden
    enumerate: function() {
      return dbAccess.getKeys();
    },

    delete: function(repoName) {
      return dbAccess.delete(repoName);
    },

    // add a subscriber
    subscribe: function(callback) {
      subscribers.push(callback);
    }
  };

});