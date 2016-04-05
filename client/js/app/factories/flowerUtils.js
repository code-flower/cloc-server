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

      var langNames = Object.keys(languages);
      var total = langNames.length;
      langNames.forEach(function(lang, index) {
        languages[lang].color = "hsl(" + parseInt(360 / total * index, 10) + ",90%,70%)";
      });

      return languages;
    },

    applyLanguagesToJson: function(json, languages) {
      (function recurse(node) {

        node.languageColor = node.language ?
                             languages[node.language].color : 
                             '#ededed';

        if (node.children) 
          node.children.forEach(recurse);

      })(json);
    }

  };
});