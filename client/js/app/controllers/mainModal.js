/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('mainModal', function($scope, appConfig) {

  //// SCOPE VARS ////

  $scope.activeTab = 'about';
  $scope.aboutTabPartial = appConfig.paths.partials + 'about-section.html';

  //// SCOPE FUNCTIONS ////

  $scope.setTab = function(tab) {
    $scope.activeTab = tab;
  };

  $scope.cancel = $scope.$close;

});