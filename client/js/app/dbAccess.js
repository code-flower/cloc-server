/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('dbAccess', function($q) {

 // console.log("running dbAccess");

  var DB;

  var DBname = 'jones2';
 
  if(!"indexedDB" in window) {
    console.log("can't used indexedDb");
    return;
  } 

  var openRequest = indexedDB.open("test4", 1);

  openRequest.onupgradeneeded = function(e) {
    console.log("running onupgradeneeded");
    var thisDB = e.target.result;
    if (!thisDB.objectStoreNames.contains(DBname))
      thisDB.createObjectStore(DBname);
  };

  openRequest.onsuccess = function(e) {
    console.log("successfully opened db:", e);
    DB = e.target.result;
  };

  return {
    set: function(key, value) {
      console.log("setting key =", key);
      console.log("value = ", value);

      var deferred = $q.defer();

      var transaction = DB.transaction([DBname], "readwrite");
      var store = transaction.objectStore(DBname);
      var request = store.add(value, key);

      request.onsuccess = function(event) {
        deferred.resolve(event);
      };

      request.onerror = function(event) {
        deferred.reject(event);
      };

      return deferred.promise;
    },

    get: function(key) {
      console.log("getting key = ", key);

      var deferred = $q.defer();

      var transaction = DB.transaction([DBname]);
      var store = transaction.objectStore(DBname);
      var request = store.get(key);

      request.onsuccess = function(event) {
        deferred.resolve(event.target.result);
      };

      request.onerror = function(event) {
        deferred.reject(event);
      };

      return deferred.promise;
    },

    getKeys: function() {
      var deferred = $q.defer();

      var transaction = DB.transaction([DBname]);
      var store = transaction.objectStore(DBname);
      var request = store.openCursor();

      var keys = [];
      request.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
          keys.push(cursor.key);
          cursor.continue();
        }
        else {
          deferred.resolve(keys);
        }
      };

      request.onerror = function(event) {
        deferred.reject(event);
      };

      return deferred.promise;
    }
  };
});