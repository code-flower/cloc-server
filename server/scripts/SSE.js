


//////////////////// WEBSOCKETS IMPLEMENTATION ////////////////////

var ws = require('nodejs-websocket');

var server = ws.createServer(function(conn) {
  console.log("New connection")
  conn.on("text", function (str) {
    console.log("Received "+str)
    conn.sendText(str.toUpperCase()+"!!!")
  })
  conn.on("close", function (code, reason) {
    console.log("Connection closed")
  })
}).listen(8001);








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


