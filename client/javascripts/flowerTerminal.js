/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerTerminal', function(flowerService) {

  return {
    restrict: 'E',
    replace: true,
    template: '<div class="flower-terminal"></div>',
    scope: {
      stream '='
    },
    link: link
  };

  function link(scope, el, attrs) {

    var emitter = flowerService.source;

  }

});