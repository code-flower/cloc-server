//////////// IMPORTS ////////////

const config = require('@config');

//////////// PRIVATE ////////////

function serveJson(response, json, statusCode) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(json));
}

function HTTPResponder(response) {

  return {
    update: function(text) {
      return false;
    },

    success: function(repo) {
      serveJson(response, {
        type: config.responseTypes.success,
        data: repo
      }, 200);
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



