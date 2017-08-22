// send WS and HTTP requests to a running server

//////////////////// IMPORTS //////////////////////

const WebSocket = require('ws');
const https = require('https');
const config = require('@config');

/////////////////// CONSTANTS /////////////////////

// server config
const HOSTNAME      = config.hostname,
      HTTP_PROTOCOL = config.protocols.HTTP,
      HTTP_PORT     = config.ports.HTTP,
      WS_PROTOCOL   = config.protocols.WS,
      WS_PORT       = config.ports.WS,
      CLOC_ENDPOINT = config.endpoints.cloc; 

/////////////////// FUNCTIONS /////////////////////

function wsReq(repo, callback) {
  const ws = new WebSocket(`${WS_PROTOCOL}://${HOSTNAME}:${WS_PORT}`, {
    rejectUnauthorized: false
  });
   
  ws.on('open', function() {
    ws.send(JSON.stringify({
      type: CLOC_ENDPOINT,
      data: repo
    }));
  });
   
  ws.on('message', msg => callback(JSON.parse(msg)));
}

function httpReq(repo, callback) {
  let opts = {
    method: 'POST',
    protocol: `${HTTP_PROTOCOL}:`,
    url: HOSTNAME,
    port: HTTP_PORT,
    path: `/${CLOC_ENDPOINT}`,
    rejectUnauthorized: false
  };

  let req = https.request(opts, res => {
    let body = '';
    res.on('data', data => body += data);
    res.on('end', () => callback(JSON.parse(body)));
  });

  req.write(JSON.stringify(repo));
  req.end();
}

/////////////////// EXPORTS /////////////////////

module.exports = {
  httpReq,
  wsReq
};
