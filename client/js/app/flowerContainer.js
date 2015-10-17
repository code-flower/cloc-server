/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerContainer', function($timeout, BASE_PATH, Gardener, flowerUtils) {

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

      console.log("repo = ", json);

      scope.folderPaths.length = 0;
      scope.folderPaths.push.apply(scope.folderPaths, flowerUtils.getFolderPaths(repo));
      scope.selectedFolder = scope.folderPaths[0];

      drawFlower(repo);
    }

    //// SCOPE VARIABLES ////

    scope.repoNames = [];
    scope.selectedRepo = null;
    scope.folderPaths = [];
    scope.selectedFolder = null;
    scope.giturl = '';

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

    scope.switchRepos = function(repoName) {
      Gardener.harvest(repoName)
      .then(buildUI);
    };

    //// EVENT LISTENERS ////

    scope.$on('flowerReady', function(e, data) {
      Gardener.harvest(data.repo)
      .then(function(repo) {
        console.log("data.repo = ", data.repo);
        console.log("repo = ", repo);
        scope.$emit('closeTerminal');
        $timeout(function() {

          scope.repoNames.push(data.repo);
          scope.selectedRepo = data.repo;
          console.log("scope.repoNames = ", scope.repoNames);
          buildUI(repo);
        }, 500);
      });
    });

    //// COMMANDS ////

    Gardener.getRepos()
    .then(function(repos) {
      Gardener.harvest(repos[0])
      .then(function(repo) {
        scope.repoNames.length = 0;
        scope.repoNames.push.apply(scope.repoNames, repos);
        scope.selectedRepo = scope.repoNames[0];
        buildUI(repo);
      });
    });
    
  }

});