/* global angular */
'use strict';

// the Gardener sends the username and repo name to
// the backend, and gets the name of a json file 
// in response.  As the json file is being generated 
// Gardener notifies its subscribers of the backend's
// progress. When the backend is done, Gardener emits
// 'flowerReady' plus the name of the json file.  

angular.module('CodeFlower')
.factory('Gardener', function($rootScope, $http) {

  var callbacks = [];

  var factory = {

    flowers: ['insights-frontend-src'],

    cultivate: function(url) {
      var source = new EventSource('/parse?url=' + encodeURIComponent(url));
      source.onmessage = function(e) {
        if (e.data === 'ERROR') {
          source.close();
        } else if (e.data.match(/END:/)) {
          source.close();
          console.log(e.data.replace('END:', ''));
          $rootScope.$broadcast('flowerReady', {repo: e.data.replace('END:', '')});
        } else {
          callbacks.forEach(function(callback) {
            callback(e.data);
          });
        }
      };
    },

    harvest: function(repo) {
      return $http.get('data/' + repo + '.json').then(function(res) {
        return res.data;
      });
    },

    subscribe: function(func) {
      callbacks.push(func);
    }
  }

  return factory;

});