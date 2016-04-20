/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('state', function(appConfig) {

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

    colorScheme: Object.keys(appConfig.colorSchemes)[0],

    initialLoad: true
  };

});