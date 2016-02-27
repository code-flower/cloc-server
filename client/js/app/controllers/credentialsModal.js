/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('credentialsModal', function($scope, $uibModalInstance) {

  console.log("inside modal controller:", $uibModalInstance);
  console.log("$scope = ", $scope);

  $scope.closeModal = function() {
    console.log("closing modal");
    $uibModalInstance.close('hello');
  };

});