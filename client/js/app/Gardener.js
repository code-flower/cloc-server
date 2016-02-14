/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('Gardener', function($rootScope, $http, $q, dbAccess, SERVER) {

  //// PRIVATE ////

  // an array of callbacks to call when the
  // eventsource receives a message
  var subscribers = [];

  // gets a flower from the backend,
  // either though git clone or git pull
  function getFlower(url) {
    var source = new EventSource(url);

    source.onmessage = function(event) {
      if (event.data === 'ERROR') {
        source.close();

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
  }

  //// THE SERVICE ////

  return {

    // grow a flower from a git clone url
    clone: function(url) {
      getFlower(SERVER + '/clone?url=' + encodeURIComponent(url));
    },

    // pluck a flower from the garden
    harvest: function(repoName) {
      var deferred = $q.defer();

      dbAccess.get(repoName)
      .then(function(data) {
        if (data)
          deferred.resolve(data);
        else {
          var url = 'data/' + repoName + '.json';
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