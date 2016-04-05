/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerLanguages', function($rootScope, $timeout, appConfig, state, flowerUtils) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'flower-languages.html',
    scope: {},
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE ////

    function calcTotals() {
      scope.totals = {
        files: 0,
        lines: 0
      };

      scope.languages.forEach(function(lang) {
        scope.totals.files += lang.files;
        scope.totals.lines += lang.lines;
      });
    }

    //// SCOPE ////

    scope.languages = [];
    scope.sortParams = {};
    scope.totals = {};

    scope.setSort = function(col) {
      scope.$emit('switchSort', {
        sortCol: col,
        sortDesc: scope.sortParams.sortCol === col ?
                  !scope.sortParams.sortDesc :
                  true
      });
    };

    //// EVENT LISTENERS ////

    scope.$watch(function () {
      return state.sortParams;
    }, function(newVal, oldVal) {
      scope.languages = state.languages;
      scope.sortParams = state.sortParams;
      if (scope.languages)
        calcTotals();
    });
  }

});