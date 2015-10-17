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

    flowers: ['data/insights-frontend-src.json'],

    cultivate: function(url) {
      var source = new EventSource('/parse?url=' + encodeURIComponent(url));
      source.onmessage = function(e) {
        if (e.data === 'END') {
          source.close();
          $rootScope.$broadcast('flowerReady', {file: 'data/test.json'})
        } else {
          callbacks.forEach(function(callback) {
            callback(e.data);
          });
        }
      };
    },

    harvest: function(flower) {
      return $http.get(flower).then(function(res) {
        return res.data;
      });
    },

    subscribe: function(func) {
      callbacks.push(func);
    }
  }

  return factory;

});