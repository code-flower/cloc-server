///////// IMPORTS //////////

var appConfig = require('../../shared/appConfig.js');

///////// PRIVATE //////////

// a wrapper for a websockets connection
function WebSocket(wsConn) {
  this.conn = wsConn;
}

WebSocket.prototype.write = function(data) {
  console.log(data);
  if (typeof data === 'string')
    data = { 
      type: appConfig.messageTypes.text,
      text: data 
    };
  this.conn.send(JSON.stringify(data));
};

WebSocket.prototype.close = function() {
  this.conn.close();
};

////////// PUBLIC //////////

module.exports = WebSocket;



