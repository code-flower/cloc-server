/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('dataService', function($rootScope, $q, appConfig, dbAccess, WS, HTTP) {

  //// PRIVATE ////

  // an array of callbacks to call when 
  // progress is made on the clone
  var subscribers = [];

  //// THE SERVICE ////

  return {

    init: function() {
      return dbAccess.init(HTTP.getSamples);
    },

    // list the flowers in the garden
    enumerate: function() {
      return dbAccess.getKeys();
    },

    // pluck a flower from the garden
    harvest: function(repoName) {
      // check the db for the given repo
      return dbAccess.get(repoName)
      .then(function(data) {
        // return data if it's in the db, otherwise hit the
        // back end, store the data in the db, and return the data
        return data || HTTP.getRepo(repoName)
                       .then(function(data) {
                         dbAccess.set(repoName, data);
                         return data;
                       });
      })
      .catch(function(err) {
        console.log("db access error = ", err);
        return err;
      });
    },

    // grow a flower from a git clone url
    clone: function(repo) {
      if (!repo.hasOwnProperty('private'))
        repo.private = false;
      WS.cloneFlower(repo, subscribers);
    },

    // delete the given repo
    delete: function(repoName) {
      return dbAccess.delete(repoName);
    },

    // add a subscriber
    subscribe: function(callback) {
      console.log("running subscribe:", callback);
      subscribers.push(callback);
    },

    deleteDB: dbAccess.deleteDB

  };

});