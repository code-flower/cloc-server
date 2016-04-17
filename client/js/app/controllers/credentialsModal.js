/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('credentialsModal', function($scope, params) {

  //// SCOPE VARIABLES ////

  $scope.username = '';
  $scope.password = '';
  $scope.url = '';
  $scope.needHTTPS = params.needHTTPS;
  $scope.gitUrl = params.gitUrl;

  //// SCOPE FUNCTIONS ////

  $scope.clone = function() {
    var obj = {
      username: $scope.username,
      password: $scope.password
    };

    if (params.needHTTPS)
      obj.url = $scope.url;

    $scope.$close(obj);
  };

  $scope.abort = $scope.$dismiss;

});