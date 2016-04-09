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
        controller: 'prefsModal',
        templateUrl: appConfig.paths.partials + 'prefs-modal.html',
      });
    };

    setTimeout(function() {
       scope.openPrefs();
    }, 500)
   
  }

});