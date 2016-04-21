/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('ignoredFiles', function(appConfig, state, dataService, $sce) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'modals/ignored-files.html',
    scope: {},
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE ////

    function displayIgnored(ignored) {
      var formatted = ('&bull; ' + ignored)
                      .replace(/\n/g, '<br/> &bull; ')
                      .replace(/&bull;\s$/, '');

      return $sce.trustAsHtml(formatted);
    }

    //// SCOPE VARS ////

    scope.repoNames = state.repoNames;
    scope.selectedRepo = state.currentRepo.name;
    scope.ignoredText = '';

    //// SCOPE FUNCTIONS ////

    scope.displayIgnored = function(repoName) {
      dataService.getIgnored(repoName)
      .then(function(ignored) {
        scope.ignoredText = displayIgnored(ignored);
      });
    };

    //// INITIALIZATION ////

    scope.displayIgnored(scope.selectedRepo);
  }

});
