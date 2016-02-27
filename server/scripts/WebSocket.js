///////// IMPORTS //////////

var appConfig = require('../../shared/appConfig.js');
var state = require('./state.js');

///////// PRIVATE //////////

// a wrapper for a websockets connection
function WebSocket(wsConn) {
  this.conn = wsConn;
}

WebSocket.prototype.write = function(data) {
  console.log(data);

  if (state.closed) 
    return;

  if (typeof data === 'string')
    data = { 
      type: appConfig.messageTypes.text,
      text: data 
    };

  this.conn.send(JSON.stringify(data));
};

WebSocket.prototype.close = function() {
  // the close function doesn't seem to work
  this.conn.close();
};

////////// PUBLIC //////////

module.exports = WebSocket;



