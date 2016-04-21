/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerLanguages', function(appConfig, state, colorSchemes, createCSSSelector) {

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

    scope.mouseEnter = function(e, lang) {
      var colorConfig = colorSchemes[state.colorScheme];
      lang.highlighted = true;

      createCSSSelector('.' + lang.class, colorConfig.highlightNode(lang));
      scope.languages.forEach(function(other) {
        if (other.language !== lang.language) 
          createCSSSelector('.' + other.class, colorConfig.suppressNode(other));
      });
    };

    scope.mouseLeave = function(e, lang) {
      var colorConfig = colorSchemes[state.colorScheme];
      lang.highlighted = false;

      createCSSSelector('.' + lang.class, colorConfig.unhighlightNode(lang));
      scope.languages.forEach(function(other) {
        if (other.language !== lang.language) 
          createCSSSelector('.' + other.class, colorConfig.unsuppressNode(other));
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