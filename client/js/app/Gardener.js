/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('Gardener', function($rootScope, $http, $q, dbAccess) {

  //// FOR TESTING THE dbAccess API ////

  console.log("dbAccess = ", dbAccess);

  var key = 'joe';
  var value = [1, 2, 3, 4, 5, 6];

  setTimeout(function() {
    dbAccess.getKeys().then(function(keys) {console.log("keys = ", keys)});
    //console.log("updating DB");
    // dbAccess.set('joe', [1, 2, 3, 4])
    // .then(function(res) {console.log("res = ", res);})
    // .catch(function(err) {console.log("err = ", err);});
     // dbAccess.get('jake')
     // .then(function(data) {
     //  console.log('data = ', data);
     // });
  }, 1000);

  //// PRIVATE ////

  // an array of callbacks to call when the
  // eventsource receives a message
  var subscribers = [];

  // gets a flower from the backend,
  // either though git clone or git pull
  function getFlower(url) {
    var source = new EventSource(url);

    source.onmessage = function(event) {
      if (event.data === 'ERROR') {
        source.close();

      } else if (event.data.match(/END:/)) {
        source.close();
        $rootScope.$broadcast('flowerReady', { 
          repoName: event.data.replace('END:', '') 
        });

      } else {
        // notify subscribers of the flower's growth
        subscribers.forEach(function(subscriber) {
          subscriber(event.data);
        });
      }
    };
  }

  //// THE SERVICE ////

  return {

    // grow a flower from a git clone url
    clone: function(url) {
      getFlower('/clone?url=' + encodeURIComponent(url));
    },

    // update a flower
    pull: function(repoName) {
      getFlower('/pull?repo=' + encodeURIComponent(repoName));
    },

    // pluck a flower from the garden
    harvest: function(repoName) {
      console.log("repoName = ", repoName);
      var deferred = $q.defer();

      dbAccess.get(repoName)
      .then(function(data) {
        if (data)
          deferred.resolve(data);
        else {
          var url = 'data/' + repoName + '.json';
          $http.get(url)
          .then(function(res) {
            dbAccess.set(repoName, res.data);
            deferred.resolve(res.data);
          });
        }
      })
      .catch(function(err) {
        console.log("error accessing key:", repoName);
        console.log("error = ", error);
        deferred.reject(error);
      });

      return deferred.promise;
    },

    // list the flowers in the garden
    enumerate: function() {
      return $http.get('/repos')
      .then(function(res) {
        return res.data;
      });
    },

    // add a subscriber
    subscribe: function(callback) {
      subscribers.push(callback);
    }
  };

});