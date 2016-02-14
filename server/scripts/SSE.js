// this file implements the server side of the EventSource protocol
// eventually need to convert this to websockets to avoid Sophos issue

// the sse connection
// var conn = null;

// module.exports = {

//   // open the connection
//   open: function(httpResponse) {
//     conn = httpResponse;
//     conn.writeHead(200, {
//       'Content-Type':  'text/event-stream',
//       'Cache-Control': 'no-cache',
//       'Connection':    'keep-alive',
//       'Access-Control-Allow-Origin': '*'
//     });
//     console.log("SSE CONNECTION OPEN");
//   },

//   // stream a bit of data
//   write: function(data) {
//     console.log(data);
//     conn.write('id: node' + '\n');
//     conn.write('data: ' + data + '\n\n');
//   },

//   // close the connection
//   close: function() {
//     conn.end();
//     conn = null;
//     console.log("SSE CONNECTION CLOSED");
//   }
// };


function SSE(httpResponse) {
  this.conn = httpResponse;
  this.conn.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  console.log("SSE CONNECTION OPEN");
};

SSE.prototype.write = function(data) {
  console.log(data);
  this.conn.write('id: node' + '\n');
  this.conn.write('data: ' + data + '\n\n');
};

SSE.prototype.close = function() {
  this.conn.end();
  this.conn = null;
  console.log("SSE CONNECTION CLOSED JAKE");
};

module.exports = SSE;

