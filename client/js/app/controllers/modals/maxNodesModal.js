/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('maxNodesModal', function($scope, params) {

  //// SCOPE VARIABLES ////

  $scope.repoName = params.repoName;
  $scope.numNodes = params.numNodes;

  //// SCOPE FUNCTIONS ////

  $scope.closeModal = function(renderAll) {
    $scope.$close({
      renderAll: renderAll
    });
  };

});