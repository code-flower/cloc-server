/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerContainer', function(BASE_PATH, Gardener, flowerUtils) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: BASE_PATH + 'flower-container.html',
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE ////

    var repo; 

    function drawFlower(folder) {
      // copy because the viz modifies the object
      var folderCopy = JSON.parse(JSON.stringify(folder));
      scope.$emit('drawFlower', folderCopy);
    }

    function buildUI(json) {
      repo = json; 

      scope.folderPaths.length = 0;
      scope.folderPaths.push.apply(scope.folderPaths, flowerUtils.getFolderPaths(repo));
      scope.selectedFolder = scope.folderPaths[0];

      drawFlower(repo);
    }

    //// SCOPE VARIABLES ////

    scope.giturl = '';
    scope.folderPaths = [];
    scope.selectedFolder = null;

    //// SCOPE FUNCTIONS ////

    scope.redrawFlower = function(folderPath) {
      var folder = flowerUtils.getFolder(repo, folderPath);
      drawFlower(folder);
    };

    scope.cultivateFlower = function() {
      scope.$emit('openTerminal');
      setTimeout(function() {
        Gardener.cultivate(scope.giturl);
      }, 500);
    };

    //// EVENT LISTENERS ////

    scope.$on('flowerReady', function(e, data) {
      Gardener.harvest(data.file)
      .then(function(flower) {
        scope.$emit('closeTerminal');
        setTimeout(function() {
          buildUI(flower);
        }, 500);
      });
    });

    //// COMMANDS ////

    Gardener.harvest(Gardener.flowers[0]).then(buildUI);
  }

});