/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerLanguages', function($rootScope, $timeout, appConfig, state, flowerUtils) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'flower-languages.html',
    scope: {},
    link: link
  };

  function link(scope, el, attrs) {
    scope.languages = [];

    scope.$watch(function() { 
      return state.currentFolder.data; 
    }, function (newVal, oldVal) {
      if (newVal)
        scope.languages = flowerUtils.analyzeFolder(newVal);
    });
  }

});