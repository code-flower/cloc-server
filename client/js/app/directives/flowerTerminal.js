/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerTerminal', function($timeout, appConfig, dataService, state) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'flower-terminal.html',
    scope: {},
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE ////

    var termBody = angular.element(el[0].querySelector('.terminal-body'));
    var scrollDown = true;
    var timer;

    // append new data to the terminal
    function handleData(data) {
      termBody.append(data + '<br>');
      if (scrollDown)
        termBody[0].scrollTop = termBody[0].scrollHeight;
    }

    // stop scrolling down for 4 secs
    // if user scrolls inside terminal
    function handleMousewheel() {
      scrollDown = false;
      clearTimeout(timer);
      timer = setTimeout(function() {
        scrollDown = true;
      }, 4000);
    }

    function isSafari() {
      var ua = navigator.userAgent.toLowerCase();
      return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
    }

    //// SCOPE VARIABLES ////

    scope.terminalOpen = false;
    scope.isSafari = isSafari();

    //// WATCHERS ////

    scope.$watch(function () {
      return state.terminalOpen;
    }, function(newVal, oldVal) {
      $timeout(function() {
        scope.terminalOpen = newVal;
      });
    });

    //// INITIALIZATION ////

    dataService.subscribe(handleData);
    termBody[0].onmousewheel = handleMousewheel;
  }
});

