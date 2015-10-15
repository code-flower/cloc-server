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
    var allCode;              // an object to represent the structure of the entire codebase
    var codeStrings = [];     // a list of strings for the dropdown, constructed from allCode

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

    function deepCopy(data) {
      return JSON.parse(JSON.stringify(data));
    }

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

    // generates an array of codeStrings from allCode
    function parseCode() {
      (function recurse(code, codeStr) {
        if (code.children) {
          codeStr += code.name + '-';
          codeStrings.push(codeStr);
          for (var i = 0; i < code.children.length; i++)
            recurse(code.children[i], codeStr);
        }
      })(allCode, '');

      for (var i = 0; i < codeStrings.length; i++) {
        codeStrings[i] = codeStrings[i].slice(0, -1);
      }
    }

    // populates the dropdown with options
    function createDropdown() {
      var dropdown = document.getElementById('project');
      for (var i = 0; i < codeStrings.length; i++) {
        var opt = document.createElement('option');
        opt.text = codeStrings[i];
        opt.value = codeStrings[i];
        dropdown.add(opt);
      }
    }

    function redrawFlower(value) {
      var props = value.split('-');
      var code = allCode;
      for (var i = 1; i < props.length; i++)  {
        for (var j = 0; j < code.children.length; j++) {
          if (code.children[j].name === props[i]) {
            code = code.children[j];
            break;
          }
        }
      }
      createCodeFlower(deepCopy(code));
    }

    function generateFlower(file) {
      d3.json(file, function(data) {
        allCode = data;    
        parseCode();
        createDropdown();
        createCodeFlower(deepCopy(allCode));
      });
    }

    //// COMMANDS ////

    // draw the flower
    generateFlower('data/insights-frontend-src.json');

  }

});