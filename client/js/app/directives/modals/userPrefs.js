// INACTIVE

// /* global angular */
// 'use strict';

// angular.module('CodeFlower')
// .directive('userPrefs', function($http, appConfig, state, colorSchemes, userPrefsService) {

//   return {
//     restrict: 'E',
//     replace: true,
//     templateUrl: appConfig.paths.partials + 'modals/user-prefs.html',
//     scope: {
//       closeModal: '='
//     },
//     link: link
//   };

//   function link(scope, el, attrs) {

//     //// SCOPE VARS ////

//     scope.colorSchemes = Object.keys(colorSchemes);
//     scope.selectedScheme = state.colorScheme;

//     //// SCOPE FUNCTIONS ////

//     // currently unused since colorScheme is now in the flowerControl
//     scope.savePrefs = function() {
//       userPrefsService.set('colorScheme', scope.selectedScheme);
//       scope.closeModal();
//       scope.$emit('prefsChanged', {
//         prefs: {
//           colorScheme: scope.selectedScheme
//         }
//       });
//     };
//   }

// });