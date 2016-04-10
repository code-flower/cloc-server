/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('flowerUtils', function(appConfig) {

  //// PRIVATE ////

  // function getLanguageColor(languages, index, colorScheme) {
  //   var total = languages.length;
  //   switch(colorScheme) {
  //     case 'rainbow':
  //       var hue = Math.round(360 * index / total);
  //       return `hsl(${hue}, 90%, 70%)`;
  //     case 'cyanara':
  //       var hue = 170 + Math.round(190 * index / total);
  //       return `hsl(${hue}, 100%, 50%)`;
  //     case 'bumblebee':
  //       return 'black';
  //   }
  // }

  function getLanguageColor(languages, index, colorScheme) {
    return appConfig.colorSchemes[colorScheme].fileColor(languages, index);
  }

  // function getNodeColor(node, languageColors, colorScheme) {
  //   switch(colorScheme) {
  //     case 'rainbow':
  //     case 'cyanara':
  //       return node.language ?
  //              languageColors[node.language] : 
  //              '#ededed';
  //     case 'bumblebee':
  //       return node.language ? 
  //              languageColors[node.language] : 
  //              'yellow';
  //   }
  // }

  function getNodeColor(node, languageColors, colorScheme) {
    return node.language ?
           languageColors[node.language] :
           appConfig.colorSchemes[colorScheme].folderColor;
  }

  //// THE SERVICE ////

  var service = {

    // returns an array of all the paths
    // in the given repo
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

    // return the portion of a repo object
    // indicated by the given folderPath
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

    // get an array for all of the languages
    // in the given folder
    getLanguages: function(folder) {
      var languagesObj = {};

      // traverse the given folder and calculate
      // the file and line folders
      (function recurse(node) {

        if (node.language) {
          var lang = node.language;

          if (!languagesObj[lang]) 
            languagesObj[lang] = {
              files: 0,
              lines: 0
            };

          languagesObj[lang].files++;
          languagesObj[lang].lines += node.size;
        }

        if (node.children) 
          node.children.forEach(recurse);

      })(folder);

      // convert the obj to an array
      var languagesArr = [];
      Object.keys(languagesObj).forEach(function(langName) {
        languagesObj[langName].language = langName;
        languagesArr.push(languagesObj[langName]);
      });

      return languagesArr;
    },

    // NOTE: this modifies the languages array
    setLanguageColors: function(languages, colorScheme) {
      languages.forEach(function(lang, index) {
        lang.color = getLanguageColor(languages, index, colorScheme);
      });
    },

    // NOTE: this modifies the languages array
    sortLanguages: function(languages, sortParams) {
      var prop = sortParams.sortCol;
      var sortFactor = sortParams.sortDesc ? 1 : -1;
      languages.sort(function (a, b) {
        return sortFactor * (b[prop] > a[prop] ? 1 : -1);
      });
    },

    // NOTE: this modifies the json object
    applyLanguageColorsToJson: function(json, languages, colorScheme) {
      // set up an object of language colors
      var languageColors = {};
      languages.forEach(function(lang) {
        languageColors[lang.language] = lang.color;
      });

      // apply colors to nodes
      (function recurse(node) {
        node.color = getNodeColor(node, languageColors, colorScheme);
        if (node.children) 
          node.children.forEach(recurse);
      })(json);
    }

  };

  return service;

});