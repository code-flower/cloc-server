/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('Gardener', function($rootScope, $http, $q, dbAccess, appConfig, cloneFlower) {

  //// PRIVATE ////

  // an array of callbacks to call when 
  // progress is made on the clone
  var subscribers = [];

  //// THE SERVICE ////

  return {

    // grow a flower from a git clone url
    clone: function(repo) {
      if (!repo.hasOwnProperty('private'))
        repo.private = false;
      cloneFlower(repo, subscribers);
    },

    update: function(repoName) {
      console.log("updating repo:", repoName);
    },

    // pluck a flower from the garden
    harvest: function(repoName) {
      var deferred = $q.defer();

      // check the db for the given repo
      dbAccess.get(repoName)
      .then(function(data) {
        // if it's there, return it
        if (data)
          deferred.resolve(data);
        // otherwise hit the back end
        else {
          var url = `http://${appConfig.hostName}:${appConfig.ports.HTTP}` + 
                    `${appConfig.endpoints.harvest}?repo=${encodeURIComponent(repoName)}`;
          $http.get(url)
          .then(function(res) {
            dbAccess.set(repoName, res.data);
            deferred.resolve(res.data);
          });
        }
      })
      .catch(function(err) {
        console.log("db access error = ", err);
        deferred.reject(err);
      });

      return deferred.promise;
    },

    // list the flowers in the garden
    enumerate: function() {
      return dbAccess.getKeys();
    },

    delete: function(repoName) {
      return dbAccess.delete(repoName);
    },

    // add a subscriber
    subscribe: function(callback) {
      subscribers.push(callback);
    }
  };

});