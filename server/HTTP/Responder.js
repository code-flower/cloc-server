//////////// IMPORTS ////////////

const config = require('@config');

//////////// PRIVATE ////////////

function serveJson(response, statusCode, json, cb) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(json), cb);
}

function HTTPResponder(response, onClose) {

  return {
    update: function(text) {
      return false;
    },

    success: function(data) {
      serveJson(response, 200, {
        type: config.responseTypes.success,
        data: data
      }, onClose);
    },

    error: function(err) {
      serveJson(response, err.statusCode, {
        type: config.responseTypes.error,
        data: err
      }, onClose);
    }
  };
}

//////////// EXPORTS ////////////

module.exports = HTTPResponder;



