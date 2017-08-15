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
        type: config.messageTypes.success,
        data: repo
      });
    },

    error: function(err) {
      serveJson(response, {
        type: config.messageTypes.error,
        data: err
      });
    },

    close: function() {
      return false;
    }
  };
}

//////////// EXPORTS ////////////

module.exports = HTTPResponder;



