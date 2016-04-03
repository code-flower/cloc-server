/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerContainer', function($timeout, appConfig, dataService, flowerUtils, state, $uibModal) {

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
    scope.languages = {};
    scope.giturl = '';
    
    scope.selectedRepo = null;
    scope.selectedFolder = null;
    
    scope.cloning = false;

    //// SCOPE FUNCTIONS ////

    scope.redrawFlower = function(folderPath) {
      var folder = flowerUtils.getFolder(repo, folderPath);
      drawFlower(folder);
      scope.languages = flowerUtils.analyzeFolder(folder);
    };

    scope.cloneFlower = function() {
      scope.$emit('openTerminal');
      $timeout(function() {
        scope.cloning = true;
        dataService.clone({ url: scope.giturl });
      }, 500);
    };

    scope.deleteFlower = function() {
      var index = scope.repoNames.indexOf(scope.selectedRepo);
      scope.repoNames.splice(index, 1);

      dataService.delete(scope.selectedRepo)
      .then(function() {
        if (!scope.repoNames.length)
          return;

        scope.selectedRepo = scope.repoNames[index] || scope.repoNames[0];
        scope.switchRepos(scope.selectedRepo);
      });
    };

    scope.abortClone = function() {
      console.log("aborting clone");
      state.cloning = false;
    };

    scope.switchRepos = function(repoName) {
      dataService.harvest(repoName).then(buildUI);
    };

    scope.deleteDB = function() {
      dataService.deleteDB();
      location.reload();
    };

    scope.openModal = function() {
      console.log("opening modal");
      var options = {
        controller: 'credentialsModal',
        templateUrl: appConfig.paths.partials + 'credentials-modal.html',
        size: 'md'
      };
      $uibModal.open(options);
    };

    //// EVENT LISTENERS ////

    scope.$on('flowerReady', function(e, data) {
      scope.cloning = false;

      // clear out any previous db entry
      dataService.delete(data.repoName)
      // then get the repo data
      .then(function() {
        return dataService.harvest(data.repoName)
      })
      // then display the data
      .then(function(repo) {

        scope.$emit('closeTerminal');
        $timeout(function() {
          scope.giturl = '';
          if (scope.repoNames.indexOf(data.repoName) === -1) {
            scope.repoNames.push(data.repoName);
            scope.repoNames.sort();
          }
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
        dataService.clone({
          url: scope.giturl,
          private: true,
          username: creds[0],
          password: creds[1]
        });
      }
    });

    scope.$on('cloneAborted', function() {
      scope.$emit('closeTerminal');
      scope.cloning = false;
    });

    //// COMMANDS ////

    console.log("appConfig = ", appConfig);
    console.log("$uibModal = ", $uibModal);

    dataService.init()
    .then(dataService.enumerate)
    .then(function(repoNames) {
      scope.repoNames = repoNames;
      scope.selectedRepo = scope.repoNames[0];

      if (scope.selectedRepo)
        scope.switchRepos(scope.selectedRepo);
    });
    
  }

});