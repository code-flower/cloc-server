// get the shared config file
var appConfig = require('../../../shared/appConfig.js');

// inject shared config into angular app
angular.module('CodeFlower', ['ui.bootstrap'])
  .constant('appConfig', appConfig);