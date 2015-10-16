/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerContainer', function(flowerService) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'javascripts/flower-container.html',
    link: link
  };

  function link(scope, el, attrs) {

    var allCode;              // an object to represent the structure of the entire codebase
    var codeStrings = [];     // a list of strings for the dropdown, constructed from allCode


    function deepCopy(data) {
      return JSON.parse(JSON.stringify(data));
    }

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
      scope.$emit('drawFlower', deepCopy(code));
    }

    function generateFlower(file) {
      d3.json(file, function(data) {
        allCode = data;    
        parseCode();
        createDropdown();

        scope.$emit('drawFlower', deepCopy(allCode));
      });
    }


    //// SCOPE VARIABLES ////

    scope.stream = function


    //// EVENT LISTENERS ////

    // respond to dropdown changes
    document.getElementById('project').addEventListener('change', function() {
      redrawFlower(this.value);
    });

    // button clicks
    document.getElementById('get-more').onclick = function() {
      scope.stream = flowerService.openSSE();
    });

    scope.$on('repoParsed', function(e, data) {
      generateFlower(data.file);
    });

    //// COMMANDS ////

    // draw the flower
    generateFlower('data/insights-frontend-src.json');

    // sent http request
    // var injector = angular.injector(['ng']);
    // var $http = injector.get('$http');

    // $http({
    //   method: 'GET',
    //   url: '/search'
    // })
    // .then(function(res) {
    //   console.log(res);
    // });

  }

});