/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerViz', function(CodeFlower, state, flowerUtils) {

  return {
    restrict: 'E',
    replace: true,
    template: '<div id="visualization"></div>',
    scope: {},
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE VARIABLES ////

    var currentCodeFlower; 

    //// PRIVATE FUNCTIONS ////

    // Recursively count all elements in a tree
    function countElements(node) {
      var nbElements = 1;
      if (node.children) 
        nbElements += node.children.reduce(function(prev, cur) { 
          return prev + countElements(cur); 
        }, 0);
      return nbElements;
    }

    function createCodeFlower(json) {
      // remove previous flower
      if (currentCodeFlower) 
        currentCodeFlower.cleanup();

      if (!json)
        return;

      // adapt layout size to the total number of elements
      // var padding = 200;
      // var total = countElements(json);
      // var h = parseInt(Math.sqrt(total) * 30, 10) + padding;
      // var w = parseInt(Math.sqrt(total) * 30, 10) + padding;

      // set width and height of the flower
      var padding = 200;
      var total = countElements(json);
      var h = Math.max(parseInt(Math.sqrt(total) * 30, 10) + padding, window.innerHeight);
      var w = h;
      
      // vertically center the flower
      var viz = document.getElementById('visualization');
      var topMargin = Math.max(window.innerHeight - h, 0) / 2.0;
      var leftMargin = Math.max(window.innerWidth - w, 0) / 2.0;
      viz.style.marginTop = topMargin + 'px';
      viz.style.marginleft = leftMargin + 'px';

      // create the flower
      currentCodeFlower = new CodeFlower('#visualization', w, h).update(json);
    }

    //// EVENT LISTENERS ////

    scope.$watch(function () {
      return state.currentFolder.data;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) { 
        var json = angular.copy(newVal);  // copy because the viz modifies the object
        flowerUtils.applyLanguageColorsToJson(json, state.languages, state.colorScheme);
        createCodeFlower(json);  
      }
    });
    
  }

});