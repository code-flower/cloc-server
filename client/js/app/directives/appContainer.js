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

    // temporary?
    scope.deleteDB = function() {
      scope.$emit('deleteDB');
    };

    scope.openPrefs = function() {
      console.log("opening prefs");

      var params = {
        test: 'hello'
      };

      $uibModal.open({

        controller: 'prefsModal',
        templateUrl: appConfig.paths.partials + 'prefs-modal.html',
        size: 'sm',
        resolve: {
          params: params
        }

      });
    };
  }

});