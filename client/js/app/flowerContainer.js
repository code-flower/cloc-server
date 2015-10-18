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

    function analyzeFolder(rootFolder) {
      var languages = {};

      (function recurse(folder) {
        if (folder.language) {
          var lang = folder.language;

          if (!languages[lang]) 
            languages[lang] = {
              files: 0,
              lines: 0
            };

          languages[lang].files++;
          languages[lang].lines += folder.size;
        }

        if (folder.children) 
          folder.children.forEach(function(child) {
            recurse(child);
          });

      })(rootFolder);

      return languages;
    }

    function buildUI(json) {
      repo = json;

      scope.folderPaths.length = 0;
      scope.folderPaths.push.apply(scope.folderPaths, flowerUtils.getFolderPaths(repo));
      scope.selectedFolder = scope.folderPaths[0];
      scope.languages = analyzeFolder(repo);

      drawFlower(repo);
    }

    //// SCOPE VARIABLES ////

    scope.repoNames = [];
    scope.folderPaths = [];
    
    scope.selectedRepo = null;
    scope.selectedFolder = null;
    scope.languages = {};

    scope.giturl = '';

    //// SCOPE FUNCTIONS ////

    scope.redrawFlower = function(folderPath) {
      var folder = flowerUtils.getFolder(repo, folderPath);
      drawFlower(folder);
      scope.languages = analyzeFolder(folder);
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

      Gardener.harvest(data.repoName)
      .then(function(repo) {

        scope.$emit('closeTerminal');
        $timeout(function() {
          scope.giturl = '';
          scope.repoNames.push(data.repoName);
          scope.selectedRepo = data.repoName;
          buildUI(repo);
        }, 500);

      });
    });

    //// COMMANDS ////

    Gardener.enumerate()
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