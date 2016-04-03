/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerLanguages', function($rootScope, $timeout, appConfig) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'flower-languages.html',
    scope: {
      languages: '='
    },
    link: function () {}
  };

});