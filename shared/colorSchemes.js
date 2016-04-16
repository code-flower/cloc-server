/*
  NOTE: the langauges array contains objects with these properties:
    - language: the name of the language
    - files: the number of files in the language
    - lines: the number of lines of code in the language
*/

module.exports = {

  periwinkle: {
    nodeColor: function(languages, index) {
      var total = languages.length;
      var hue = 170 + Math.round(190 * index / total);
      return `hsl(${hue}, 100%, 50%)`;
    },
    highlightNode: function(language) {
      return '';
    },
    unhighlightNode: function(language) {
      return '';
    },
    suppressNode: function(language) {
      return 'display: none';
    },
    unsuppressNode: function(language) {
      return 'display: initial';
    }
  },

  bumblebee: {
    nodeColor: function(languages, index) {
      return 'black';
    },
    highlightNode: function(language) {
      return 'fill: red !important';
    },
    unhighlightNode: function(language) {
      return 'fill: initial';
    },
    suppressNode: function(language) {
      return '';
    },
    unsuppressNode: function(language) {
      return '';
    }
  },

  rainbow: {
    nodeColor: function(languages, index) {
      var total = languages.length;
      var hue = Math.round(360 * index / total);
      return `hsl(${hue}, 90%, 70%)`;
    },
    highlightNode: function(language) {
      return '';
    },
    unhighlightNode: function(language) {
      return '';
    },
    suppressNode: function(language) {
      return 'display: none';
    },
    unsuppressNode: function(language) {
      return 'display: initial';
    }
  }

};