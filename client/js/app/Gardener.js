/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('Gardener', function($rootScope, $http) {

  var subscribers = [];

  return {

    // grow a flower from a git clone url
    cultivate: function(url) {
      var source = new EventSource('/cultivate?url=' + encodeURIComponent(url));

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
    },

    // pluck a flower from the garden
    harvest: function(repoName) {
      var url = 'data/' + repoName + '.json';
      return $http.get(url)
      .then(function(res) {
        return res.data;
      });
    },

    // list the flowers in the garden
    enumerate: function() {
      return $http.get('/repos')
      .then(function(res) {
        return res.data;
      });
    },

    // add a subscriber
    subscribe: function(callback) {
      subscribers.push(callback);
    }
  };

});