
// a wrapper for a websockets connection

function WebSocket(wsConn) {
  this.conn = wsConn;
}

WebSocket.prototype.write = function(data) {
  console.log(data);
  this.conn.send(data);
};

WebSocket.prototype.close = function() {
  this.conn.close();
};

module.exports = WebSocket;



