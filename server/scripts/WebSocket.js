///////// IMPORTS //////////

var appConfig = require('../../shared/appConfig.js');
var state = require('./state.js');

///////// PRIVATE //////////

// the constructor
function WebSocket(wsConn) {
  this.conn = wsConn;
}

// private: not to be called outside this file
WebSocket.prototype._send = function(data) {
  console.log("Sending:", data);

  if (state.closed)
    return;

  this.conn.send(JSON.stringify(data));
};

// public methods
WebSocket.prototype.text = function(text) {
  var self = this;
  var lines = text.split('\n');
  lines.forEach(function(line) {
    self._send({
      type: appConfig.messageTypes.text,
      text: line
    }); 
  });
};

WebSocket.prototype.invalidUrl = function(repo) {
  this.text('Not a valid git clone url.\n');
  this._send({
    type: appConfig.messageTypes.error
  });
  this.close();
};

WebSocket.prototype.needHTTPS = function(repo) {
  this.text('Please use an https url.\n');
  this._send({
    type: appConfig.messageTypes.error
  });
  this.close();
};

WebSocket.prototype.credentials = function(repo, needHTTPS) {
  this._send({
    type: appConfig.messageTypes.credentials,
    needHTTPS: needHTTPS
  });
  this.close();
};

WebSocket.prototype.complete = function(repo) {
  this._send({
    type: appConfig.messageTypes.complete,
    repoName: repo.fullName
  });
  this.close();
};

WebSocket.prototype.unauthorized = function(repo) {
  this._send({
    type: appConfig.messageTypes.unauthorized
  });
  this.close();
};

WebSocket.prototype.close = function() {
  // the close function doesn't seem to work
  this.conn.close();
};

////////// PUBLIC //////////

module.exports = WebSocket;



