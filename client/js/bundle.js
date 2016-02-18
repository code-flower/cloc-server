(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('CodeFlower', function() {

  var CodeFlower = function(selector, w, h) {
    this.w = w;
    this.h = h;

    d3.select(selector).selectAll("svg").remove();

    this.svg = d3.select(selector).append("svg:svg")
      .attr('width', w)
      .attr('height', h);

    this.svg.append("svg:rect")
      .style("stroke", "#999")
      .style("fill", "#fff")
      .attr('width', w)
      .attr('height', h);

    this.force = d3.layout.force()
      .on("tick", this.tick.bind(this))
      .charge(function(d) { return d._children ? -d.size / 100 : -40; })
      .linkDistance(function(d) { return d.target._children ? 80 : 25; })
      .size([h, w]);

    // center the scrollbars
    document.body.scrollTop = (h - window.innerHeight) / 2.0;
    document.body.scrollLeft = (w - window.innerWidth) / 2.0;
  };

  CodeFlower.prototype.update = function(json) {
    if (json) this.json = json;

    this.json.fixed = true;
    this.json.x = this.w / 2;
    this.json.y = this.h / 2;

    var nodes = this.flatten(this.json);
    var links = d3.layout.tree().links(nodes);
    var total = nodes.length || 1;

    // remove existing text (will readd it afterwards to be sure it's on top)
    this.svg.selectAll("text").remove();

    // Restart the force layout
    this.force
      .gravity(Math.atan(total / 50) / Math.PI * 0.4)
      .nodes(nodes)
      .links(links)
      .start();

    // Update the links
    this.link = this.svg.selectAll("line.link")
      .data(links, function(d) { return d.target.name; });

    // Enter any new links
    this.link.enter().insert("svg:line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    // Exit any old links.
    this.link.exit().remove();

    // Update the nodes
    this.node = this.svg.selectAll("circle.node")
      .data(nodes, function(d) { return d.name; })
      .classed("collapsed", function(d) { return d._children ? 1 : 0; });

    this.node.transition()
      .attr("r", function(d) { return d.children ? 3.5 : Math.pow(d.size, 2/5) || 1; });

    // Enter any new nodes
    this.node.enter().append('svg:circle')
      .attr("class", "node")
      .classed('directory', function(d) { return (d._children || d.children) ? 1 : 0; })
      .attr("r", function(d) { return d.children ? 3.5 : Math.pow(d.size, 2/5) || 1; })
      .style("fill", function color(d) {
        return "hsl(" + parseInt(360 / total * d.id, 10) + ",90%,70%)";
      })
      .call(this.force.drag)
      .on("click", this.click.bind(this))
      .on("mouseover", this.mouseover.bind(this))
      .on("mouseout", this.mouseout.bind(this));

    // Exit any old nodes
    this.node.exit().remove();

    this.text = this.svg.append('svg:text')
      .attr('class', 'nodetext')
      .attr('dy', 0)
      .attr('dx', 0)
      .attr('text-anchor', 'middle');

    return this;
  };

  CodeFlower.prototype.flatten = function(root) {
    var nodes = [], i = 0;

    function recurse(node) {
      if (node.children) {
        node.size = node.children.reduce(function(p, v) {
          return p + recurse(v);
        }, 0);
      }
      if (!node.id) node.id = ++i;
      nodes.push(node);
      return node.size;
    }

    root.size = recurse(root);
    return nodes;
  };

  CodeFlower.prototype.click = function(d) {
    // Toggle children on click.
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.update();
  };

  CodeFlower.prototype.mouseover = function(d) {
    this.text.attr('transform', 'translate(' + d.x + ',' + (d.y - 5 - (d.children ? 3.5 : Math.sqrt(d.size) / 2)) + ')')
      .text(d.name + ": " + d.size + " loc")
      .style('display', null);
  };

  CodeFlower.prototype.mouseout = function(d) {
    this.text.style('display', 'none');
  };

  CodeFlower.prototype.tick = function() {
    var h = this.h;
    var w = this.w;
    this.link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    this.node.attr("transform", function(d) {
      return "translate(" + Math.max(5, Math.min(w - 5, d.x)) + "," + Math.max(5, Math.min(h - 5, d.y)) + ")";
    });
  };

  CodeFlower.prototype.cleanup = function() {
    this.update([]);
    this.force.stop();
  };

  return CodeFlower;

});
},{}],2:[function(require,module,exports){
/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('Gardener', function($rootScope, $http, $q, dbAccess) {

  //// PRIVATE ////

  // an array of callbacks to call when the
  // eventsource receives a message
  var subscribers = [];

  // gets a flower from the backend
  function getFlower(data) {
    var source = new WebSocket('ws://' + window.location.hostname + ':8001');

    source.onopen = function(event) {
      console.log("Websocket connection opening:", event);
      source.send(JSON.stringify(data));  
    };

    source.onmessage = function(event) {
      if (event.data === 'ERROR') {
        source.close();

      } else if (event.data === 'CREDENTIALS') {
        source.close();
        $rootScope.$broadcast('needCredentials');

      } else if (event.data === 'UNAUTHORIZED') {
        source.close();
        $rootScope.$broadcast('needCredentials', { 
          invalid: true 
        });

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

    source.onclose = function() {
      console.log("Websocket connection closed")
    };

    source.onerror = function() {
      console.error("Websocket connection error")
    };
  }

  //// THE SERVICE ////

  return {

    // grow a flower from a git clone url
    clone: function(url, isPrivate) {
      getFlower({
        url: url,
        isPrivate: isPrivate || false
      });
    },

    update: function(repoName) {
      console.log("updating repo:", repoName);
    },

    // pluck a flower from the garden
    harvest: function(repoName) {
      var deferred = $q.defer();

      dbAccess.get(repoName)
      .then(function(data) {
        if (data)
          deferred.resolve(data);
        else {
          var url = '/harvest?repo=' + encodeURIComponent(repoName);
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
},{}],3:[function(require,module,exports){
/* global angular */
'use strict';

angular.module('CodeFlower', [])
.constant('BASE_PATH', 'js/app/');
},{}],4:[function(require,module,exports){
/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('dbAccess', function($q, $http) {

  //// CONSTANTS ////

  var repoDB = 'repos';
  var repoTable = 'repoTable';

  //// THE DATABASE OBJECT ////

  var DB;

  //// PRIVATE FUNCTIONS ////

  // grab the sample repos and add them to the DB
  function loadSamples() {
    return $http.get('/samples').then(function(response) {
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
},{}],5:[function(require,module,exports){
/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerContainer', function($timeout, BASE_PATH, Gardener, flowerUtils, dbAccess) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: BASE_PATH + 'flower-container.html',
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE ////

    var repo; 

    function drawFlower(folder) {
      // copy because the viz modifies the object
      var folderCopy = JSON.parse(JSON.stringify(folder));
      scope.$emit('drawFlower', folderCopy);
    }

    function buildUI(json) {
      repo = json;

      scope.folderPaths.length = 0;
      scope.folderPaths.push.apply(scope.folderPaths, flowerUtils.getFolderPaths(repo));
      scope.selectedFolder = scope.folderPaths[0];
      scope.languages = flowerUtils.analyzeFolder(repo);
      drawFlower(repo);
    }

    //// SCOPE VARIABLES ////

    scope.repoNames = [];
    scope.folderPaths = [];
    
    scope.selectedRepo = null;
    scope.selectedFolder = null;
    scope.languages = {};

    scope.giturl = '';

    //// SCOPE FUNCTIONS ////

    scope.redrawFlower = function(folderPath) {
      var folder = flowerUtils.getFolder(repo, folderPath);
      drawFlower(folder);
      scope.languages = flowerUtils.analyzeFolder(folder);
    };

    scope.cloneFlower = function() {
      scope.$emit('openTerminal');
      setTimeout(function() {
        Gardener.clone(scope.giturl);
      }, 500);
    };

    scope.updateFlower = function() {
      scope.$emit('openTerminal');
      setTimeout(function() {
        Gardener.update(scope.selectedRepo);
      }, 500);
    };

    scope.deleteFlower = function() {
      var index = scope.repoNames.indexOf(scope.selectedRepo);
      scope.repoNames.splice(index, 1);

      Gardener.delete(scope.selectedRepo)
      .then(function() {
        if (!scope.repoNames.length)
          return;

        scope.selectedRepo = scope.repoNames[index] || scope.repoNames[0];
        scope.switchRepos(scope.selectedRepo);
      });
    };

    scope.switchRepos = function(repoName) {
      Gardener.harvest(repoName).then(buildUI);
    };

    //// EVENT LISTENERS ////

    scope.$on('flowerReady', function(e, data) {

      Gardener.harvest(data.repoName)
      .then(function(repo) {

        scope.$emit('closeTerminal');
        $timeout(function() {
          scope.giturl = '';
          scope.repoNames.push(data.repoName);
          scope.selectedRepo = data.repoName;
          buildUI(repo);
        }, 500);

      });
    });

    scope.$on('needCredentials', function(e, data) {
      // need to turn this into a modal rather than a prompt
      // if (data && data.invalid) is true then the modal should
      // state that the previously entered credentials are invalid
      // otherwise simply ask for credentials
      
      var message = "Please enter credentials." + (data && data.invalid ? ' MORON' : '');
      var creds = prompt(message);
      if (creds !== null) {
        var urlWithCreds = scope.giturl.replace('://', '://' + creds + '@');
        Gardener.clone(urlWithCreds, true);
      }
    });

    //// COMMANDS ////

    dbAccess.init()
    .then(Gardener.enumerate)
    .then(function(repoNames) {

      scope.repoNames.length = 0;
      scope.repoNames.push.apply(scope.repoNames, repoNames);
      scope.selectedRepo = scope.repoNames[0];

      if (scope.selectedRepo)
        scope.switchRepos(scope.selectedRepo);
    });
    
  }

});
},{}],6:[function(require,module,exports){
/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerTerminal', function($timeout, BASE_PATH, Gardener) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: BASE_PATH + 'flower-terminal.html',
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE VARIABLES ////

    var termBody = angular.element(el[0].querySelector('.terminal-body'));
    var scrollDown = true;
    var timer;

    //// SCOPE VARIABLES ////

    scope.terminalOpen = false;

    //// EVENT LISTENERS ////

    // stop scrolling down for 4 secs
    // if user scrolls inside terminal
    termBody[0].onmousewheel = function() {
      scrollDown = false;

      clearTimeout(timer);
      timer = setTimeout(function() {
        scrollDown = true;
      }, 4000);
    }

    scope.$on('openTerminal', function() {
      scope.terminalOpen = true;
    });

    scope.$on('closeTerminal', function() {
      $timeout(function() {
        scope.terminalOpen = false;
      }, 0);
    });

    //// COMMANDS ////

    Gardener.subscribe(function(data) {
      termBody.append(data + '<br>');
      if (scrollDown)       
        termBody[0].scrollTop = termBody[0].scrollHeight;
    });

  }
});


},{}],7:[function(require,module,exports){
/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('flowerUtils', function() {

  return {

    getFolderPaths: function(repo) {
      var folderPaths = [];

      // generate path strings
      (function recurse(folder, folderPath) {
        if (folder.children) {
          folderPath += folder.name + '/';
          folderPaths.push(folderPath);
          for (var i = 0; i < folder.children.length; i++)
            recurse(folder.children[i], folderPath);
        }
      })(repo, '');

      // remove the trailing slashes
      folderPaths = folderPaths.map(function(str) { return str.slice(0, -1); });

      return folderPaths;
    },

    getFolder: function(repo, folderPath) {
      var folder = repo;
      var props = folderPath.split('/');
      for (var i = 1; i < props.length; i++)  {
        for (var j = 0; j < folder.children.length; j++) {
          if (folder.children[j].name === props[i]) {
            folder = folder.children[j];
            break;
          }
        }
      }
      return folder;
    },

    analyzeFolder: function(rootFolder) {
      var languages = {};

      (function recurse(folder) {
        if (folder.language) {
          var lang = folder.language;

          if (!languages[lang]) 
            languages[lang] = {
              files: 0,
              lines: 0
            };

          languages[lang].files++;
          languages[lang].lines += folder.size;
        }

        if (folder.children) 
          folder.children.forEach(function(child) {
            recurse(child);
          });

      })(rootFolder);

      return languages;
    }

  };
});
},{}],8:[function(require,module,exports){
/* global angular */
'use strict';

angular.module('CodeFlower')
.directive('flowerViz', function(CodeFlower) {

  return {
    restrict: 'E',
    replace: true,
    template: '<div id="visualization"></div>',
    link: link
  };

  function link(scope, el, attrs) {

    //// PRIVATE VARIABLES ////

    var currentCodeFlower; 

    //// PRIVATE FUNCTIONS ////

    // Recursively count all elements in a tree
    // copied here from dataConverter.js
    function countElements(node) {
      var nbElements = 1;
      if (node.children) 
        nbElements += node.children.reduce(function(p, v) { return p + countElements(v); }, 0);
      return nbElements;
    }

    function createCodeFlower(json) {
      // remove previous flower
      if (currentCodeFlower) 
        currentCodeFlower.cleanup();

      // adapt layout size to the total number of elements
      // var padding = 200;
      // var total = countElements(json);
      // var h = parseInt(Math.sqrt(total) * 30, 10) + padding;
      // var w = parseInt(Math.sqrt(total) * 30, 10) + padding;

      // set width and height of the flower
      var padding = 200;
      var total = countElements(json);
      var h = Math.max(parseInt(Math.sqrt(total) * 30, 10) + padding, window.innerHeight);
      var w = h;
      
      // vertically center the flower
      var viz = document.getElementById('visualization');
      var topMargin = Math.max(window.innerHeight - h, 0) / 2.0;
      var leftMargin = Math.max(window.innerWidth - w, 0) / 2.0;
      viz.style.marginTop = topMargin + 'px';
      viz.style.marginleft = leftMargin + 'px';

      // create the flower
      currentCodeFlower = new CodeFlower('#visualization', w, h).update(json);
    }

    //// EVENT LISTENERS ////

    scope.$on('drawFlower', function(e, data) {
      createCodeFlower(data);
    });

  }

});
},{}],9:[function(require,module,exports){
require('./app/app.js');
require('./app/CodeFlower.js');
require('./app/dbAccess.js');
require('./app/flowerContainer.js');
require('./app/flowerTerminal.js');
require('./app/flowerUtils.js');
require('./app/flowerViz.js');
require('./app/Gardener.js');




},{"./app/CodeFlower.js":1,"./app/Gardener.js":2,"./app/app.js":3,"./app/dbAccess.js":4,"./app/flowerContainer.js":5,"./app/flowerTerminal.js":6,"./app/flowerUtils.js":7,"./app/flowerViz.js":8}]},{},[9]);
