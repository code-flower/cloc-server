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

    console.log("running flower viz link function");

    //// PRIVATE VARIABLES ////

    var currentCodeFlower;    // a CodeFlower object

    //// PRIVATE FUNCTIONS ////

    // Recursively count all elements in a tree
    // copied here from dataConverter.js
    function countElements(node) {
      var nbElements = 1;
      if (node.children) {
        nbElements += node.children.reduce(function(p, v) { return p + countElements(v); }, 0);
      }
      return nbElements;
    };

    function createCodeFlower(json) {
      // remove previous flower to save memory
      if (currentCodeFlower) currentCodeFlower.cleanup();

      // adapt layout size to the total number of elements
      var total = countElements(json);
      var w = parseInt(Math.sqrt(total) * 30, 10) + 100;
      var h = parseInt(Math.sqrt(total) * 30, 10) + 100;

      // vertically center the flower
      if (h < window.innerHeight) {
        var topMargin = (window.innerHeight - h) / 2.0;
        document.getElementById('visualization').style.marginTop = topMargin + 'px';
      }

      // create a new CodeFlower
      currentCodeFlower = new CodeFlower("#visualization", w, h).update(json);
    };

    scope.$on('drawFlower', function(e, data) {
      console.log("data = ", data);
      createCodeFlower(data);
    });

  }

});