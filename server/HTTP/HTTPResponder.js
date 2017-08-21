//////////// IMPORTS ////////////

const config = require('@config'),
      serveJson = require('./serveJson');

//////////// PRIVATE ////////////

function HTTPResponder(response) {

  return {
    update: function(text) {
      return false;
    },

    success: function(repo) {
      serveJson(response, {
        type: config.responseTypes.success,
        data: repo
      });
    },

    error: function(err) {
      serveJson(response, {
        type: config.responseTypes.error,
        data: err
      }, err.statusCode);
    },

    close: function() {
      return false;
    }
  };
}

//////////// EXPORTS ////////////

module.exports = HTTPResponder;



