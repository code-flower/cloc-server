//////////// IMPORTS ////////////

var config = require('@config');

//////////// PRIVATE ////////////

// CONSTRUCTOR //
function WebSocket(wsConn) {
  this.conn = wsConn;
}

// PRIVATE METHODS //
WebSocket.prototype._send = function(data) {
  //console.log("Sending:", data.hasOwnProperty('text') ? data.text : data);
  if (this.conn)
    this.conn.send(JSON.stringify(data));
};

// PUBLIC METHODS
WebSocket.prototype.update = function(text) {
  let lines = text.toString('utf-8').split('\n');
  lines.forEach(line => {
    this._send({
      type: config.messageTypes.update,
      data: { text: line }
    }); 
  });
};

WebSocket.prototype.success = function(repo) {
  this._send({
    type: config.messageTypes.success,
    data: repo
  });
};

WebSocket.prototype.error = function(err) {
  this._send({
    type: config.messageTypes.error,
    data: err
  });
};

WebSocket.prototype.close = function() {
  this.conn.close();
  this.conn = null;
};

//////////// EXPORTS ////////////

module.exports = WebSocket;



