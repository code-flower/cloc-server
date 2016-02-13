/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('dbAccess', function($q) {

  //// CONSTANTS ////

  var repoDB = 'repos';
  var repoTable = 'repoTable';

  //// THE DATABASE OBJECT ////

  var DB;

  //// THE SERVICE ////
  
  return {

    init: function() {
      if (DB) 
        return $q.when();

      var deferred = $q.defer();

      if(!"indexedDB" in window) {
        console.log("can't used indexedDb");
        return;
      } 

      var openRequest = indexedDB.open(repoDB, 1);

      openRequest.onupgradeneeded = function(e) {
        var thisDB = e.target.result;
        if (!thisDB.objectStoreNames.contains(repoTable))
          thisDB.createObjectStore(repoTable);
      };

      openRequest.onsuccess = function(e) {
        DB = e.target.result;
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
});