/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerTerminal', function(Gardener) {

  return {
    restrict: 'E',
    replace: true,
    template: '<div class="flower-terminal"></div>',
    link: link
  };

  function link(scope, el, attrs) {

    var scrollDown = true;

    Gardener.subscribe(function(data) {
      el.append('<div>' + data + '</div>');
      if (scrollDown)       
        el[0].scrollTop = el[0].scrollHeight;
    });

    el[0].onmousewheel = function() {
      scrollDown = false;
      setTimeout(function() {
        scrollDown = true;
      }, 3000);
    }

  }
});