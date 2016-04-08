/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('state', function(userPrefs) {

  return {
    gitUrl: '',

    repoNames: [],

    currentRepo: {
      name: '',
      data: null
    },

    folderPaths: [],

    currentFolder: {
      path: '',
      data: null
    },

    sortParams: {
      sortCol: 'lines',
      sortDesc: true
    },

    cloning: false,

    terminalOpen: false,

    colorScheme: userPrefs.get('colorScheme')
  };

});