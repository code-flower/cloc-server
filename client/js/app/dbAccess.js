/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('dbAccess', function($q, $http, appConfig) {

  //// CONSTANTS ////

  var repoDB = 'repos';
  var repoTable = 'repoTable';

  //// THE DATABASE OBJECT ////

  var DB;

  //// PRIVATE FUNCTIONS ////

  // grab the sample repos and add them to the DB
  function loadSamples() {
    var url = 'http://' + appConfig.hostName + ':' + appConfig.ports.HTTP + '/samples';
    return $http.get(url).then(function(response) {
      return $q.all(response.data.map(function(repo) {
        return service.set(repo.name, repo.data);
      }));
    });
  }

  //// THE SERVICE ////

  var service = {

    init: function() {

      // uncomment to delete the database
      // service.deleteDB(repoDB);
      // return $q.when();

      if (DB) 
        return $q.when();

      if(!"indexedDB" in window) {
        console.log("Can't used indexedDb");
        return;
      } 

      var deferred = $q.defer();
      var openRequest = indexedDB.open(repoDB, 1);
      var firstTime = false;

      // this runs only if the database was just created
      // the onsuccess function runs immediately afterwards
      openRequest.onupgradeneeded = function(e) {
        var thisDB = e.target.result;
        if (!thisDB.objectStoreNames.contains(repoTable)) {
          thisDB.createObjectStore(repoTable);
          firstTime = true;
        }
      };

      // this runs every time the DB is opened
      openRequest.onsuccess = function(e) {
        DB = e.target.result;

        if (firstTime) 
          loadSamples().then(function() {
            deferred.resolve(e);
          });
        else 
          deferred.resolve(e);
      };

      openRequest.onerror = function(e) {
        deferred.reject(e);
      };

      return deferred.promise;
    },

    set: function(key, value) {
      var deferred = $q.defer();

      var transaction = DB.transaction([repoTable], "readwrite");
      var store = transaction.objectStore(repoTable);
      var request = store.add(value, key);

      request.onsuccess = function(e) {
        deferred.resolve(e);
      };

      request.onerror = function(e) {
        deferred.reject(e);
      };

      return deferred.promise;
    },

    get: function(key) {
      var deferred = $q.defer();

      var transaction = DB.transaction([repoTable]);
      var store = transaction.objectStore(repoTable);
      var request = store.get(key);

      request.onsuccess = function(e) {
        deferred.resolve(e.target.result);
      };

      request.onerror = function(e) {
        deferred.reject(e);
      };

      return deferred.promise;
    },

    delete: function(key) {
      var deferred = $q.defer();

      var transaction = DB.transaction([repoTable], "readwrite");
      var store = transaction.objectStore(repoTable);
      var request = store.delete(key);

      request.onsuccess = function(e) {
        deferred.resolve(e.target.result);
      };

      request.onerror = function(e) {
        deferred.reject(e);
      };

      return deferred.promise;
    },

    getKeys: function() {
      var deferred = $q.defer();

      var transaction = DB.transaction([repoTable]);
      var store = transaction.objectStore(repoTable);
      var request = store.openCursor();

      var keys = [];
      request.onsuccess = function(e) {
        var cursor = e.target.result;
        if (cursor) {
          keys.push(cursor.key);
          cursor.continue();
        }
        else {
          deferred.resolve(keys);
        }
      };

      request.onerror = function(e) {
        deferred.reject(e);
      };

      return deferred.promise;
    },

    deleteDB: function(DBname) {
      var req = indexedDB.deleteDatabase(DBname);
      req.onsuccess = function () {
        console.log("Deleted database successfully");
      };
      req.onerror = function () {
        console.log("Couldn't delete database");
      };
      req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
      };
    }
  };

  return service;
});