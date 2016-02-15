/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerContainer', function($timeout, BASE_PATH, Gardener, flowerUtils, dbAccess) {

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
      console.log("redrawing flower");
      var folder = flowerUtils.getFolder(repo, folderPath);
      drawFlower(folder);
      scope.languages = analyzeFolder(folder);
    };

    scope.cloneFlower = function() {
      scope.$emit('openTerminal');
      setTimeout(function() {
        Gardener.clone(scope.giturl);
      }, 500);
    };

    scope.pullFlower = function() {
      scope.$emit('openTerminal');
      setTimeout(function() {
        Gardener.pull(scope.selectedRepo);
      }, 500);
    };

    scope.deleteFlower = function() {
      var index = scope.repoNames.indexOf(scope.selectedRepo);
      scope.repoNames.splice(index, 1);

      Gardener.delete(scope.selectedRepo)
      .then(function() {
        if (!scope.repoNames.length)
          return;

        scope.selectedRepo = scope.repoNames[index] || scope.repoNames[0];
        scope.switchRepos(scope.selectedRepo);
      });
    };

    scope.switchRepos = function(repoName) {
      Gardener.harvest(repoName).then(buildUI);
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

    scope.$on('needCredentials', function(e, data) {
      // need to turn this into a modal rather than a prompt
      // if (data && data.invalid) is true then the modal should
      // state that the previously entered credentials are invalid
      // otherwise simply ask for credentials
      
      var message = "Please enter credentials." + (data && data.invalid ? ' MORON' : '');
      var creds = prompt(message);
      if (creds !== null) {
        var urlWithCreds = scope.giturl.replace('://', '://' + creds + '@');
        Gardener.clone(urlWithCreds, true);
      }
    });

    //// COMMANDS ////

    dbAccess.init()
    .then(Gardener.enumerate)
    .then(function(repoNames) {

      scope.repoNames.length = 0;
      scope.repoNames.push.apply(scope.repoNames, repoNames);
      scope.selectedRepo = scope.repoNames[0];

      Gardener.harvest(repoNames[0]).then(buildUI);
    });
    
  }

});