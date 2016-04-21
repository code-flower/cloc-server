/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('contactMe', function($http, appConfig) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: appConfig.paths.partials + 'modals/contact-me.html',
    scope: {
      closeModal: '='
    },
    link: link
  };

  function link(scope, el, attrs) {

    //// SCOPE VARS ////

    scope.emailText = '';
    scope.emailStatus = '';
    scope.emailDisabled = false;

    //// SCOPE FUNCTIONS ////

    scope.sendEmail = function(text) {
      scope.emailStatus = '';
      scope.emailDisabled = true;
      $http({
        method: 'GET',
        url: appConfig.endpoints.email + '?message=' + encodeURIComponent(text)
      })
      .then(function(res) {
        scope.emailStatus = 'Message sent. Thanks!';
      })
      .catch(function(err) {
        scope.emailStatus = 'Message not sent. Something went wrong.';
      })
      .finally(function() {
        scope.emailText = '';
        scope.emailDisabled = false;
      });
    };

    scope.deleteDB = function() {
      scope.$emit('deleteDB');
    };
  }

});