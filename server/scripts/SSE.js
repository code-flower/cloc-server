// this file implements the server side of the EventSource protocol
// eventually need to convert this to websockets to avoid Sophos issue

// the sse connection
var conn = null;

module.exports = {

  // open the connection
  open: function(httpResponse) {
    conn = httpResponse;
    conn.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    console.log("SSE CONNECTION OPEN");
  },

  // stream a bit of data
  write: function(data) {
    console.log(data);
    conn.write('id: node' + '\n');
    conn.write('data: ' + data + '\n\n');
  },

  // close the connection
  close: function() {
    conn.end();
    conn = null;
    console.log("SSE CONNECTION CLOSED");
  }
};