/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerControl', function ($rootScope, appConfig, state) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'flower-control.html',
    link: link
  };

  function link(scope, el, attrs) {
    scope.state = state;
    scope.gitUrl = '';
    scope.selectedRepo = '';
    scope.selectedFolder = '';

    scope.doClone = function(gitUrl) {
      scope.$emit('doClone', gitUrl);
    };

    scope.abortClone = function () {
      scope.$emit('abortClone');
    };

    scope.switchRepo = function(repoName) {
      scope.$emit('switchRepo', repoName);
    };

    scope.deleteRepo = function(repoName) {
      scope.$emit('deleteRepo', repoName);
    };

    scope.switchFolder = function (folderPath) {
      scope.$emit('switchFolder', folderPath);
    };


    //// WATCHERS ////

    // this is awkward, should only need to watch the first time because
    // afterwards selectedRepo/selectedFolder are already set correctly
    // maybe fire a 'newRepo' or 'newFolder' event from the dispatcher?

    scope.$watch(function () {
      return state.currentRepo.name;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal)
        scope.selectedRepo = newVal;
    });

    scope.$watch(function () {
      return state.currentFolder.path;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal)
        scope.selectedFolder = newVal;
    });

  }

});