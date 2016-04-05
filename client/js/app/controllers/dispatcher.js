/* global angular */
'use strict';

angular.module('CodeFlower')
.controller('dispatcher', function($scope, $timeout, $uibModal, appConfig, state, dataService, flowerUtils) {

  //// PRIVATE FUNCTIONS ////

  function setSort(sortData) {
    flowerUtils.sortLanguages(state.languages, sortData);
  }

  function setFolder(folderPath) {
    var folder = flowerUtils.getFolder(state.currentRepo.data, folderPath);
    state.currentFolder = {
      path: folderPath,
      data: folder
    };
    state.languages = flowerUtils.getLanguages(folder);
    setSort({
      sortCol: 'lines',
      sortDesc: true
    });
  }

  function buildUI(repoName, repoData) {
    state.currentRepo = {
      name: repoName,
      data: repoData
    };
    state.folderPaths = flowerUtils.getFolderPaths(repoData);
    setFolder(state.folderPaths[0]);
  }

  function setRepo(repoName) {
    dataService.harvest(repoName)
    .then(function(repoData) {
      buildUI(repoName, repoData);
    });
  }

  function doClone(gitUrl) {
    state.gitUrl = gitUrl;
    state.cloning = true;
    state.terminalOpen = true;

    $timeout(function() {
      dataService.clone({ url: gitUrl });
    }, 500);
  }

  function handleNewRepo(repoName) {
    state.gitUrl = '';
    state.cloning = false;

    dataService.delete(repoName)
    .then(function() {
      return dataService.harvest(repoName)
    })
    .then(function(repoData) {

      state.terminalOpen = false;
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
        setRepo(state.repoNames[index] || state.repoNames[0]);
    });
  }

  function getCredentials(params) {
    $uibModal.open({

      controller: 'credentialsModal',
      templateUrl: appConfig.paths.partials + 'credentials-modal.html',
      size: 'sm',
      resolve: {
        params: params
      }

    }).result.then(function(data) {

      dataService.clone({
        url: data.url || state.gitUrl,
        private: true,
        username: data.username,
        password: data.password
      });

    })
    .catch(function(reason) {

      state.gitUrl = '';
      state.cloning = false;
      state.terminalOpen = false;

    });
  }

  //// EVENT LISTENERS ////

  $scope.$on('doClone', function(e, gitUrl) {
    doClone(gitUrl);
  });

  $scope.$on('abortClone', function(e, data) {
    state.gitUrl = '';
    state.cloning = false;
    state.terminalOpen = false;
  });

  $scope.$on('needCredentials', function(e, data) {
    getCredentials(data);
  });

  $scope.$on('cloneComplete', function(e, data) {
    handleNewRepo(data.repoName);
  });

  $scope.$on('cloneError', function(e, data) {
    $timeout(function() { 
      state.cloning = false; 
    });
  });

  $scope.$on('switchRepo', function(e, repoName) {
    setRepo(repoName);
  });

  $scope.$on('deleteRepo', function(e, repoName) {
    deleteRepo(repoName);
  });

  $scope.$on('switchFolder', function(e, folderPath) {
    setFolder(folderPath);
  });

  $scope.$on('switchSort', function (e, sortData) {
    console.log("switching sort:", sortData);
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
      setRepo(repoNames[0]);
  });

});
