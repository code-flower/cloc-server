/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('prefsModal', function($scope, params, appConfig) {

  console.log("inside prefs modal:", params);

  $scope.activeTab = 'prefs';

  $scope.colorThemes = appConfig.colorThemes;
  //$scope.selectedTheme = userPrefs.get('colorTheme');

  $scope.setTab = function(tab) {
    console.log("setting tab:", tab);
    $scope.activeTab = tab;
  };

  $scope.setTheme = function(theme) {
    console.log("setting theme:", theme);
  };

  $scope.deleteDB = function() {
    $scope.$emit('deleteDB');
  };

});