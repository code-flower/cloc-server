/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('Gardener', function($rootScope, $http, $q, dbAccess) {

  //// PRIVATE ////

  // an array of callbacks to call when the
  // eventsource receives a message
  var subscribers = [];

  // gets a flower from the backend
  function getFlower(data) {
    var source = new WebSocket('ws://' + window.location.hostname + ':8001');

    source.onopen = function(event) {
      console.log("Websocket connection opening:", event);
      source.send(JSON.stringify(data));  
    };

    source.onmessage = function(event) {
      if (event.data === 'ERROR') {
        source.close();

      } else if (event.data === 'CREDENTIALS') {
        source.close();
        $rootScope.$broadcast('needCredentials');

      } else if (event.data === 'UNAUTHORIZED') {
        source.close();
        $rootScope.$broadcast('needCredentials', { 
          invalid: true 
        });

      } else if (event.data.match(/END:/)) {
        source.close();
        $rootScope.$broadcast('flowerReady', { 
          repoName: event.data.replace('END:', '') 
        });

      } else {
        // notify subscribers of the flower's growth
        subscribers.forEach(function(subscriber) {
          subscriber(event.data);
        });
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
          var url = '/harvest?repo=' + encodeURIComponent(repoName);
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