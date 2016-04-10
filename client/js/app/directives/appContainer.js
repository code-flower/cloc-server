/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('appContainer', function(appConfig, state, $uibModal) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'app-container.html',
    controller: 'dispatcher',
    link: link
  };

  function link (scope, el, attrs) {
    scope.state = state;

    scope.backgroundColor = appConfig.colorSchemes[state.colorScheme].backgroundColor;

    scope.openPrefs = function() {
      $uibModal.open({
        controller: 'mainModal',
        templateUrl: appConfig.paths.partials + 'main-modal.html',
      });
    };

    scope.$watch(function() { return state.colorScheme; }, function(newVal, oldVal) {
      scope.backgroundColor = appConfig.colorSchemes[state.colorScheme].backgroundColor;
    });

    // for testing modal
    // setTimeout(function() {
    //    scope.openPrefs();
    // }, 500);
  }

});