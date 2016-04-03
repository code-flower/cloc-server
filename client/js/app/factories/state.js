/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('state', function() {

  return {
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

    giturl: '',

    cloning: false
  };

});