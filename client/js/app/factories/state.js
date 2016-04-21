/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('state', function(colorSchemes) {

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

    languages: [],

    sortParams: {
      sortCol: 'lines',
      sortDesc: true
    },

    cloning: false,

    terminalOpen: false,

    colorScheme: Object.keys(colorSchemes)[0],

    initialLoad: true
  };

});