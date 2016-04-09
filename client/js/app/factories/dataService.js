/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('dataService', function(appConfig, dbAccess, WS, HTTP) {

  //// PRIVATE ////

  // an array of callbacks to call when 
  // progress is made on the clone
  var subscribers = [];

  //// THE SERVICE ////

  return {

    init: function() {
      return dbAccess.init(HTTP.getSamples);
    },

    // list the repos in the client-side DB
    enumerate: function() {
      return dbAccess.getKeys();
    },

    // initiate a clone
    clone: function(repo) {
      if (!repo.hasOwnProperty('private'))
        repo.private = false;
      WS.cloneRepo(repo, subscribers);
    },

    // get the data for a repo, either from the client-side
    // DB (if the data is there) or from the backed
    harvest: function(repoName) {
      return dbAccess.get(repoName)
        .then(function(data) {
          return data ? 
                 data.repoData : 
                 HTTP.getRepo(repoName)
                 .then(function(data) {
                   dbAccess.set(repoName, data);
                   return data.repoData;
                 });
        });
    },

    getIgnored: function(repoName) {
      return dbAccess.get(repoName) 
        .then(function(data) {
          return data.ignored;
        });
    },

    // delete the given repo
    delete: function(repoName) {
      return dbAccess.delete(repoName);
    },

    // add a subscriber
    subscribe: function(callback) {
      subscribers.push(callback);
    },

    deleteDB: dbAccess.deleteDB

  };

});
