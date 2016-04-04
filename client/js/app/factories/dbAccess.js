/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('dbAccess', function($q, appConfig) {

  //// CONSTANTS ////

  var repoDB = appConfig.database.dbName;
  var repoTable = appConfig.database.tableName;

  //// PRIVATE ////

  var DB;           // the database object
  var getSamples;   // a function to get samples from the back end

  function loadSamples() {
    return getSamples().then(function(samples) {
      return $q.all(samples.map(function(repo) {
        return service.set(repo.name, repo.data);
      }));
    });
  }

  //// THE SERVICE ////

  var service = {

    init: function(getSamplesFunc) {
      getSamples = getSamplesFunc;

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
        } else {
          deferred.resolve(keys);
        }
      };

      request.onerror = function(e) {
        deferred.reject(e);
      };

      return deferred.promise;
    },

    deleteDB: function() {
      var req = indexedDB.deleteDatabase(repoDB);
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
