//////////// IMPORTS ////////////

var config = require('@config');

//////////// PRIVATE ////////////

function WSResponder(wsConn, onClose) {

  let sendData = function(data) {
    if (wsConn && wsConn.readyState === 1) 
      wsConn.send(JSON.stringify(data));
  };

  return {
    update: function(text) {
      let lines = text.toString('utf-8').split('\n');
      lines.forEach(line => {
        sendData({
          type: config.responseTypes.update,
          data: { text: line }
        }); 
      });
    },

    success: function(repo) {
      sendData({
        type: config.responseTypes.success,
        data: repo
      });
    },

    error: function(err) {
      sendData({
        type: config.responseTypes.error,
        data: err
      });
    },

    close: function() {
      if (wsConn && wsConn.readyState === 1) {
        wsConn.close();
        wsConn = null;
        onClose();
      }
    }
  };
}

//////////// EXPORTS ////////////

module.exports = WSResponder;



