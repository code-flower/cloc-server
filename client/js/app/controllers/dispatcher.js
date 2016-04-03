/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('dispatcher', function ($scope, appConfig, state, dataService, flowerUtils) {

  //// PRIVATE VARIABLES ////

  //// PRIVATE FUNCTIONS ////

  function switchFolder(folderPath) {
    state.currentFolder = {
      path: folderPath,
      data: flowerUtils.getFolder(state.currentRepo.data, folderPath)
    };
  }

  function buildUI(repoData) {
    state.currentRepo.data = repoData;
    state.folderPaths = flowerUtils.getFolderPaths(repoData);
    switchFolder(state.folderPaths[0]);
  }

  function switchRepo(repoName) {
    state.currentRepo.name = repoName;
    dataService.harvest(repoName).then(buildUI);
  }


  //// EVENT HANDLERS ////

  $scope.$on('doClone', function(e, data) {
    console.log("received doClone:", data);
  });

  $scope.$on('abortClone', function(e, data) {
    console.log("received abortClone:", data);
  });

  $scope.$on('switchRepo', function(e, repoName) {
    switchRepo(repoName);
  });

  $scope.$on('deleteRepo', function(e, data) {
    console.log("received deleteRepo:", data);
  });

  $scope.$on('switchFolder', function(e, folderPath) {
    switchFolder(folderPath);
  });

  $scope.$on('deleteDB', function() {
    dataService.deleteDB();
    location.reload();
  });

  //// COMMANDS ////

  dataService.init()
  .then(dataService.enumerate)
  .then(function(repoNames) {
    state.repoNames = repoNames;
    if (repoNames[0])
      switchRepo(repoNames[0]);
  });


});