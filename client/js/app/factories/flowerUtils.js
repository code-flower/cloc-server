/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('flowerUtils', function() {

  var service = {

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

    getLanguages: function(folder) {
      var languages = {};

      (function recurse(node) {
        if (node.language) {
          var lang = node.language;

          if (!languages[lang]) 
            languages[lang] = {
              files: 0,
              lines: 0
            };

          languages[lang].files++;
          languages[lang].lines += node.size;
        }

        if (node.children) 
          node.children.forEach(recurse);

      })(folder);

      // convert the obj to an array
      var languagesArr = [];
      Object.keys(languages).forEach(function(langName) {
        languages[langName].language = langName;
        languagesArr.push(languages[langName]);
      });

      // sort
      service.sortLanguages(languagesArr, {
        sortCol: 'lines',
        sortDesc: true
      });

      // apply colors
      var total = languagesArr.length;
      languagesArr.forEach(function(lang, index) {
        lang.color = "hsl(" + parseInt(360 / total * index, 10) + ",90%,70%)";
      });

      return languagesArr;
    },

    // NOTE: this modifies the languages object
    sortLanguages: function(languages, sortData) {
      var prop = sortData.sortCol;
      var sortFactor = sortData.sortDesc ? 1 : -1;
      languages.sort(function (a, b) {
        return sortFactor * (b[prop] > a[prop] ? 1 : -1);
      });
    },

    // NOTE: this modifies the json object
    applyLanguagesToJson: function(json, languages) {
      // set up an object of language colors
      var languageColors = {};
      languages.forEach(function(lang) {
        languageColors[lang.language] = lang.color;
      });

      // apply colors to nodes
      (function recurse(node) {

        node.languageColor = node.language ?
                             languageColors[node.language] : 
                             '#ededed';
        if (node.children) 
          node.children.forEach(recurse);

      })(json);
    }

  };

  return service;

});