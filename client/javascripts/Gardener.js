/* global angular */
'use strict';

// the Gardener sends the username and repo name to
// the backend, and gets the name of a json file 
// in response.  As the json file is being generated 
// Gardener notifies its subscribers of the backend's
// progress. When the backend is done, Gardener emits
// 'flowerReady' plus the name of the json file.  

angular.module('CodeFlower')
.factory('Gardener', function($rootScope) {

  var callbacks = [];

  var factory = {

    harvest: function(url) {
      console.log(encodeURIComponent(url));
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

      // source.addEventListener('open', function(e) {
      //   console.log("SSE connection opened");
      // });
    },

    subscribe: function(func) {
      callbacks.push(func);
    }
  }

  return factory;

});