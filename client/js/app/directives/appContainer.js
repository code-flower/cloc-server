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

    scope.openModal = function() {
      $uibModal.open({
        controller: 'mainModal',
        templateUrl: appConfig.paths.partials + 'modals/main-modal.html',
        animation: false
      });
    };

    // for testing modal
    // setTimeout(function() {
    //    scope.openPrefs();
    // }, 500);
  }

});