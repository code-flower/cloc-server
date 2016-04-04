/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('state', function() {

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

    cloning: false,

    terminalOpen: false
  };

});