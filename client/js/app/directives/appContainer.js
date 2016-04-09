/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('appContainer', function(appConfig, state, $uibModal) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'app-container.html',
    link: link
  };

  function link (scope, el, attrs) {
    scope.state = state;

    scope.openPrefs = function() {
      $uibModal.open({
        controller: 'mainModal',
        templateUrl: appConfig.paths.partials + 'main-modal.html',
      });
    };

    // for testing modal
    // setTimeout(function() {
    //    scope.openPrefs();
    // }, 500);
  }

});