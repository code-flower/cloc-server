/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('ignoredFiles', function(appConfig, state, dataService) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'ignored-files.html',
    scope: {},
    link: link
  };

  function link(scope, el, attrs) {
    console.log("inside ignored files link");

    scope.state = state;

    scope.selectedRepo = state.currentRepo.name;

    scope.ignoredText = '';

    scope.displayIgnored = function(repoName) {
      console.log("displaying:", repoName);
      dataService.getIgnored(repoName)
      .then(function(data) {
        console.log(data);
        scope.ignoredText = data;
      });
    };

    scope.displayIgnored(scope.selectedRepo);
  }

});
