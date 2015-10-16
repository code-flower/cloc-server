/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerTerminal', function(Gardener) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'javascripts/flower-terminal.html',
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE VARIABLES ////

    var termBody = angular.element(el[0].querySelector('.terminal-body'));
    var scrollDown = true;
    var timer;

    //// SCOPE VARIABLES ////

    scope.terminalOpen = false;

    //// EVENT LISTENERS ////

    // stop scrolling down for 4 secs
    // if user scrolls inside terminal
    termBody[0].onmousewheel = function() {
      scrollDown = false;

      clearTimeout(timer);
      timer = setTimeout(function() {
        scrollDown = true;
      }, 4000);
    }

    scope.$on('openTerminal', function() {
      scope.terminalOpen = true;
    });

    scope.$on('closeTerminal', function() {
      scope.terminalOpen = false;
      scope.$apply();
    });

    //// COMMANDS ////

    Gardener.subscribe(function(data) {
      termBody.append(data + '<br>');
      if (scrollDown)       
        termBody[0].scrollTop = termBody[0].scrollHeight;
    });

  }
});

