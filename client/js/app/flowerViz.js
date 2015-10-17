/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerViz', function() {

  return {
    restrict: 'E',
    replace: true,
    template: '<div id="visualization"></div>',
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE VARIABLES ////

    var currentCodeFlower; 

    //// PRIVATE FUNCTIONS ////

    // Recursively count all elements in a tree
    // copied here from dataConverter.js
    function countElements(node) {
      var nbElements = 1;
      if (node.children) 
        nbElements += node.children.reduce(function(p, v) { return p + countElements(v); }, 0);
      return nbElements;
    }

    function createCodeFlower(json) {
      // remove previous flower
      if (currentCodeFlower) 
        currentCodeFlower.cleanup();

      // adapt layout size to the total number of elements
      var minSize = 500;
      var total = countElements(json);
      var w = Math.max(parseInt(Math.sqrt(total) * 30, 10) + 100, minSize);
      var h = Math.max(parseInt(Math.sqrt(total) * 30, 10) + 100, minSize);

      // vertically center the flower
      var topMargin = Math.max(window.innerHeight - h, 0) / 2.0;
      document.getElementById('visualization').style.marginTop = topMargin + 'px';

      // create the flower
      currentCodeFlower = new CodeFlower('#visualization', w, h).update(json);
    }

    //// EVENT LISTENERS ////

    scope.$on('drawFlower', function(e, data) {
      createCodeFlower(data);
    });

  }

});