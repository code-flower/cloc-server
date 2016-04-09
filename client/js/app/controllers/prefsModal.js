/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('prefsModal', function($scope, appConfig, state, userPrefs) {

  //// SCOPE VARS ////

  $scope.activeTab = 'ignored';
  $scope.colorSchemes = appConfig.colorSchemes;
  $scope.selectedScheme = state.colorScheme;

  //// SCOPE FUNCTIONS ////

  $scope.setTab = function(tab) {
    $scope.activeTab = tab;
  };

  $scope.savePrefs = function() {
    userPrefs.set('colorScheme', $scope.selectedScheme);
    $scope.$close();
    $scope.$emit('prefsChanged', {
      prefs: {
        colorScheme: $scope.selectedScheme
      }
    });
  };

  $scope.deleteDB = function() {
    $scope.$emit('deleteDB');
  };

  $scope.cancel = $scope.$close;

});