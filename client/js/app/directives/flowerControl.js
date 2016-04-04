/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerControl', function(appConfig, state) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'flower-control.html',
    link: link
  };

  function link(scope, el, attrs) {

    //// SCOPE VARIABLES ////

    scope.state = state;
    scope.gitUrl = '';
    scope.selectedRepo = '';
    scope.selectedFolder = '';

    //// EVENT EMITTERS ////

    scope.doClone = function(gitUrl) {
      scope.$emit('doClone', gitUrl);
    };

    scope.abortClone = function() {
      scope.$emit('abortClone');
      scope.gitUrl = '';
    };

    scope.switchRepo = function(repoName) {
      scope.$emit('switchRepo', repoName);
    };

    scope.deleteRepo = function(repoName) {
      scope.$emit('deleteRepo', repoName);
    };

    scope.switchFolder = function(folderPath) {
      scope.$emit('switchFolder', folderPath);
    };

    //// WATCHERS ////

    scope.$watch(function() {
      return state.currentRepo.name;
    }, function(newVal, oldVal) {
      scope.selectedRepo = newVal;
    });

    scope.$watch(function () {
      return state.currentFolder.path;
    }, function(newVal, oldVal) {
        scope.selectedFolder = newVal;
    });

    scope.$watch(function() {
      return state.gitUrl;
    }, function(newVal, oldVal) {
      scope.gitUrl = newVal;
    });
  }

});