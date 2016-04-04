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

    cloning: false,

    gitUrl: ''
    //gitUrl: 'git@dustlandmedia.git.beanstalkapp.com:/dustlandmedia/roofshootserver.git'
    
  };

});