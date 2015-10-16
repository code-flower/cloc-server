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
    var timer;

    Gardener.subscribe(function(data) {
      el.append(data + '<br>');
      if (scrollDown)       
        el[0].scrollTop = el[0].scrollHeight;
    });

    el[0].onmousewheel = function() {
      scrollDown = false;

      clearTimeout(timer);
      timer = setTimeout(function() {
        scrollDown = true;
      }, 5000);
    }

  }
});