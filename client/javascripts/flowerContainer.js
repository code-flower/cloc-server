/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerContainer', function(Gardener) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'javascripts/flower-container.html',
    link: link
  };

  function link(scope, el, attrs) {

    var allCode;              // an object to represent the structure of the entire codebase

    function sendCode(code) {
      var codeCopy = JSON.parse(JSON.stringify(code));
      scope.$emit('drawFlower', codeCopy);
    }

    // generates an array of codeStrings from allCode
    function parseCode() {
      var pathStrings = [];

      (function recurse(code, pathStr) {
        if (code.children) {
          pathStr += code.name + '/';
          pathStrings.push(pathStr);
          for (var i = 0; i < code.children.length; i++)
            recurse(code.children[i], pathStr);
        }
      })(allCode, '');

      for (var i = 0; i < pathStrings.length; i++) {
        pathStrings[i] = pathStrings[i].slice(0, -1);
      }

      return pathStrings;
    }

    // populates the dropdown with options
    function createDropdown(pathStrings) {
      var dropdown = document.getElementById('project');
      for (var i = 0; i < pathStrings.length; i++) {
        var opt = document.createElement('option');
        opt.text = pathStrings[i];
        opt.value = pathStrings[i];
        dropdown.add(opt);
      }
    }

    function redrawFlower(pathString) {
      var props = pathString.split('/');
      var code = allCode;
      for (var i = 1; i < props.length; i++)  {
        for (var j = 0; j < code.children.length; j++) {
          if (code.children[j].name === props[i]) {
            code = code.children[j];
            break;
          }
        }
      }
      sendCode(code);
    }

    function generateFlower(file) {
      d3.json(file, function(json) {
        allCode = json; 
        var pathStrings = parseCode(allCode);  
        createDropdown(pathStrings);
        sendCode(allCode);
      });
    }

    //// SCOPE FUNCTIONS ////

    scope.gituser = 'jake';
    scope.gitrepo = 'code';

    //// EVENT LISTENERS ////

    // respond to dropdown changes
    document.getElementById('project').addEventListener('change', function() {
      redrawFlower(this.value);
    });

    // button clicks
    document.getElementById('get-more').onclick = function() {
      Gardener.harvest(scope.gituser, scope.gitrepo);
    };

    scope.$on('flowerReady', function(e, data) {
      generateFlower(data.file);
    });

    //// COMMANDS ////

    // draw the flower
    generateFlower('data/insights-frontend-src.json');
  }

});