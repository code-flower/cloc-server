/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerContainer', function($timeout, appConfig, Gardener, flowerUtils, dbAccess) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'flower-container.html',
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
      scope.languages = flowerUtils.analyzeFolder(repo);
      drawFlower(repo);
    }

    //// SCOPE VARIABLES ////

    scope.repoNames = [];
    scope.folderPaths = [];
    
    scope.selectedRepo = null;
    scope.selectedFolder = null;
    scope.languages = {};

    scope.giturl = '';
    scope.cloning = false;

    //// SCOPE FUNCTIONS ////

    scope.redrawFlower = function(folderPath) {
      var folder = flowerUtils.getFolder(repo, folderPath);
      drawFlower(folder);
      scope.languages = flowerUtils.analyzeFolder(folder);
    };

    scope.cloneFlower = function() {
      scope.$emit('openTerminal');
      setTimeout(function() {
        $timeout(function() { scope.cloning = true; });
        Gardener.clone({ url: scope.giturl });
      }, 500);
    };

    scope.updateFlower = function() {
      scope.$emit('openTerminal');
      setTimeout(function() {
        Gardener.update(scope.selectedRepo);
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

    scope.abortClone = function() {
      console.log("aborting clone");
    };

    scope.switchRepos = function(repoName) {
      Gardener.harvest(repoName).then(buildUI);
    };

    scope.deleteDB = function() {
      dbAccess.deleteDB();
      location.reload();
    };

    //// EVENT LISTENERS ////

    scope.$on('flowerReady', function(e, data) {
      $timeout(function() { scope.cloning = true; });

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

      console.log("data in needCredentials:", data);
      
      var message = "Please enter your {username}:{password}." + (data && data.invalid ? ' MORON' : '');
      var creds = prompt(message).split(':'); // temporary, eventually there will be two fields

      if (data.needHTTPS) {
        console.log("Asking for HTTPS");
        scope.giturl = prompt("Please enter an HTTPS url.");
      }

      if (creds !== null) {
        Gardener.clone({
          url: scope.giturl,
          private: true,
          username: creds[0],
          password: creds[1]
        });
      }
    });

    //// COMMANDS ////

    console.log("appConfig = ", appConfig);

    dbAccess.init()
    .then(Gardener.enumerate)
    .then(function(repoNames) {
      scope.repoNames = repoNames;
      scope.selectedRepo = scope.repoNames[0];

      if (scope.selectedRepo)
        scope.switchRepos(scope.selectedRepo);
    });
    
  }

});