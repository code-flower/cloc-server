/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('appContainer', function(appConfig, state) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'app-container.html',
    link: link
  };

  function link (scope, el, attrs) {
    scope.state = state;

    // temporary?
    scope.deleteDB = function () {
      scope.$emit('deleteDB');
    };
  }

});