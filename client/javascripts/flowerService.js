/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('flowerService', function($rootScope) {

  var factory = {

    source: null,

    openSSE: function() {
      factory.source = new EventSource('/talk');

      factory.source.addEventListener('open', function(e) {
        console.log("SSE connection opened");
      });

      factory.source.onmessage = function(e) {
        console.log(e.data);
        if (e.data === 'END') {
          factory.source.close();
          $rootScope.$broadcast('repoParsed', {file: 'data/test.json'})
        }
      };
    }
  }

  return factory;

});