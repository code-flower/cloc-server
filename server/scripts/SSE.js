
//////////////////// WEBSOCKETS IMPLEMENTATION ////////////////////

function SSE(wsConn) {
  this.conn = wsConn;
}

SSE.prototype.write = function(data) {
  console.log(data);
  this.conn.send(data);
};

SSE.prototype.close = function() {
  this.conn.close();
};

module.exports = SSE;



/////////////////// EVENT SOURCE IMPLEMENTATION ///////////////////
// this file implements the server side of the EventSource protocol
// eventually need to convert this to websockets to avoid Sophos issue

////////// PRIVATE /////////

// function SSE(httpResponse) {
//   this.conn = httpResponse;
//   this.conn.writeHead(200, {
//     'Content-Type':  'text/event-stream',
//     'Cache-Control': 'no-cache',
//     'Connection':    'keep-alive',
//     'Access-Control-Allow-Origin': '*'
//   });
//   console.log("SSE CONNECTION OPEN");
// };

// SSE.prototype.write = function(data) {
//   console.log(data);
//   this.conn.write('id: node' + '\n');
//   this.conn.write('data: ' + data + '\n\n');
// };

// SSE.prototype.close = function() {
//   this.conn.end();
//   this.conn = null;
//   console.log("SSE CONNECTION CLOSED");
// };

////////// PUBLIC //////////

// module.exports = SSE;


