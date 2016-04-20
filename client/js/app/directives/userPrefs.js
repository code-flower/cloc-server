/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('userPrefs', function($http, appConfig, state, userPrefsService) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'user-prefs.html',
    scope: {
      closeModal: '='
    },
    link: link
  };

  function link(scope, el, attrs) {

    //// SCOPE VARS ////

    scope.colorSchemes = Object.keys(appConfig.colorSchemes);
    scope.selectedScheme = state.colorScheme;
    scope.emailText = '';
    scope.emailStatus = '';
    scope.emailDisabled = false;

    //// SCOPE FUNCTIONS ////

    // currently unused since colorScheme is now in the flowerControl
    scope.savePrefs = function() {
      userPrefsService.set('colorScheme', scope.selectedScheme);
      scope.closeModal();
      scope.$emit('prefsChanged', {
        prefs: {
          colorScheme: scope.selectedScheme
        }
      });
    };

    scope.sendEmail = function(text) {
      scope.emailStatus = '';
      scope.emailDisabled = true;
      $http({
        method: 'GET',
        url: appConfig.endpoints.email + '?message=' + encodeURIComponent(text)
      })
      .then(function(res) {
        scope.emailStatus = 'Message sent. Thanks!';
      })
      .catch(function(err) {
        scope.emailStatus = 'Message not sent. Something went wrong.';
      })
      .finally(function() {
        scope.emailText = '';
        scope.emailDisabled = false;
      });
    };

    scope.deleteDB = function() {
      scope.$emit('deleteDB');
    };
  }

});