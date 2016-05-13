/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('HTTP', function ($http, appConfig) {

  var origin = `${appConfig.protocol.HTTP}://${appConfig.hostName}:${appConfig.ports.HTTP}`;

  return {

    getRepo: function(repoName) {
      var url = origin + `${appConfig.endpoints.harvest}?repo=${encodeURIComponent(repoName)}`;
      return $http.get(url)
      .then(function(res) {
        return res.data;
      });
    },

    getSamples: function() {
      var url = origin + appConfig.endpoints.samples;
      return $http.get(url)
      .then(function(res) {
        return res.data;
      });
    }

  };
});