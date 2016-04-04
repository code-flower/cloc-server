/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('dispatcher', function($scope, $timeout, appConfig, state, dataService, flowerUtils) {

  //// PRIVATE FUNCTIONS ////

  function switchFolder(folderPath) {
    state.currentFolder = {
      path: folderPath,
      data: flowerUtils.getFolder(state.currentRepo.data, folderPath)
    };
  }

  function buildUI(repoName, repoData) {
    state.currentRepo = {
      name: repoName,
      data: repoData
    };
    state.folderPaths = flowerUtils.getFolderPaths(repoData);
    switchFolder(state.folderPaths[0]);
  }

  function switchRepo(repoName) {
    dataService.harvest(repoName)
    .then(function(repoData) {
      buildUI(repoName, repoData);
    });
  }

  function doClone(gitUrl) {
    $scope.$broadcast('openTerminal');
    $timeout(function() {
      state.cloning = true;
      dataService.clone({ url: gitUrl });
    }, 500);
  }

  function handleNewRepo(repoName) {
    state.cloning = false;

    dataService.delete(repoName)
    .then(function() {
      return dataService.harvest(repoName)
    })
    .then(function(repoData) {

      $scope.$broadcast('closeTerminal');
      $timeout(function() {
        if (state.repoNames.indexOf(repoName) === -1) {
          state.repoNames.push(repoName);
          state.repoNames.sort();
        }
        buildUI(repoName, repoData);
      }, 500);

    });
  }

  function deleteRepo(repoName) {
    var index = state.repoNames.indexOf(repoName);
    state.repoNames.splice(index, 1);

    dataService.delete(repoName)
    .then(function() {
      if (state.repoNames.length)
        switchRepo(state.repoNames[index] || state.repoNames[0]);
    });
  }

  //// EVENT LISTENERS ////

  $scope.$on('doClone', function(e, gitUrl) {
    doClone(gitUrl);
  });

  $scope.$on('abortClone', function(e, data) {
    state.cloning = false;
    $scope.$broadcast('closeTerminal');
  });

  $scope.$on('cloneComplete', function (e, data) {
    handleNewRepo(data.repoName);
  });

  $scope.$on('switchRepo', function(e, repoName) {
    switchRepo(repoName);
  });

  $scope.$on('deleteRepo', function(e, repoName) {
    deleteRepo(repoName);
  });

  $scope.$on('switchFolder', function(e, folderPath) {
    switchFolder(folderPath);
  });

  $scope.$on('deleteDB', function(e, data) {
    dataService.deleteDB();
    location.reload();
  });

  //// STATE INITIALIZATION ////

  dataService.init()
  .then(dataService.enumerate)
  .then(function(repoNames) {
    state.repoNames = repoNames;
    if (repoNames[0])
      switchRepo(repoNames[0]);
  });

});

