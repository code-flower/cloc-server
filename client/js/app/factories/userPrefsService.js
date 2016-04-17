/* CURRENTLY UNUSED */

/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('userPrefsService', function(appConfig) {

  return {
    get: function(pref) {
      return localStorage[pref];
    },

    set: function(pref, val) {
      localStorage[pref] = val;
    }
  };

});