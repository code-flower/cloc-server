/* global angular */
'use strict';

angular.module('CodeFlower')
.factory('flowerUtils', function(appConfig) {

  //// PRIVATE ////

  function getLanguageColor(languages, index, colorScheme) {
    return appConfig.colorSchemes[colorScheme].fileColor(languages, index);
  }

  function getNodeColor(node, languageColors, colorScheme) {
    return node.language ? 
           languageColors[node.language] :  // files
           null;                            // folder -- color defined in scss files
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
      Object.keys(languagesObj).forEach(function(langName, index) {
        languagesObj[langName].language = langName;
        languagesObj[langName].languageClass = 'lang-' + index;
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
    applyLanguageColorsToJson: function(json, languages) {
      // set up an object of language colors
      var languageColors = {};
      languages.forEach(function(lang) {
        languageColors[lang.language] = lang.color;
      });

      // apply colors to nodes
      (function recurse(node) {
        node.color = getNodeColor(node, languageColors);
        if (node.children) 
          node.children.forEach(recurse);
      })(json);
    },

    // http://stackoverflow.com/questions/1720320/how-to-dynamically-create-css-class-in-javascript-and-apply
    createCSSSelector: function(selector, style) {
      if (!document.styleSheets) return;
      if (document.getElementsByTagName('head').length == 0) return;

      var styleSheet,mediaType;

      if (document.styleSheets.length > 0) {
        for (var i = 0, l = document.styleSheets.length; i < l; i++) {
          if (document.styleSheets[i].disabled) 
            continue;
          var media = document.styleSheets[i].media;
          mediaType = typeof media;

          if (mediaType === 'string') {
            if (media === '' || (media.indexOf('screen') !== -1)) {
              styleSheet = document.styleSheets[i];
            }
          }
          else if (mediaType=='object') {
            if (media.mediaText === '' || (media.mediaText.indexOf('screen') !== -1)) {
              styleSheet = document.styleSheets[i];
            }
          }

          if (typeof styleSheet !== 'undefined') 
            break;
        }
      }

      if (typeof styleSheet === 'undefined') {
        var styleSheetElement = document.createElement('style');
        styleSheetElement.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(styleSheetElement);

        for (i = 0; i < document.styleSheets.length; i++) {
          if (document.styleSheets[i].disabled) {
            continue;
          }
          styleSheet = document.styleSheets[i];
        }

        mediaType = typeof styleSheet.media;
      }

      if (mediaType === 'string') {
        for (var i = 0, l = styleSheet.rules.length; i < l; i++) {
          if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase()==selector.toLowerCase()) {
            styleSheet.rules[i].style.cssText = style;
            return;
          }
        }
        styleSheet.addRule(selector,style);
      }
      else if (mediaType === 'object') {
        var styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
        for (var i = 0; i < styleSheetLength; i++) {
          if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
            styleSheet.cssRules[i].style.cssText = style;
            return;
          }
        }
        styleSheet.insertRule(selector + '{' + style + '}', styleSheetLength);
      }
    }

  };

  return service;

});