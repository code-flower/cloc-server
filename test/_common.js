// send WS and HTTP requests to a running server

//////////////////// IMPORTS //////////////////////

const WebSocket = require('ws'),
      https = require('https'),
      config = require('@config'),
      argv = require('minimist')(process.argv);

/////////////////// CONSTANTS /////////////////////

// server config
const HOSTNAME = argv.remote ? 'api.codeflower.la' : 'localhost',
      PORT     = argv.remote ? 443 : 8000;

const RES_TYPES = config.responseTypes,
      ERRORS    = config.errors;

/////////////////// FUNCTIONS /////////////////////

function wsReq(repo, callback) {
  const ws = new WebSocket(`wss://${HOSTNAME}:${PORT}`, {
    rejectUnauthorized: false
  });
   
  ws.on('open', function() {
    ws.send(JSON.stringify({
      endpoint: config.endpoints.cloc,
      params: repo
    }));
  });
   
  ws.on('message', msg => callback(JSON.parse(msg)));
}

function httpReq(repo, callback) {
  let opts = {
    method: 'POST',
    protocol: 'https:',
    hostname: HOSTNAME,
    port: PORT,
    path: `/${config.endpoints.cloc}`,
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

function showResponse(res, showUpdate) {
  switch(res.type) {
    case RES_TYPES.update:
      if (showUpdate)
        console.log(res.data.text);
      break;
    case RES_TYPES.success:
      console.log("SUCCESS: " + res.data.fNameBr);
      break;
    case RES_TYPES.error:
      console.log("ERROR: ", res.data);
      break;
  }
}

function testResponse(test, res) {
  switch(res.type) {
    case RES_TYPES.success:
    case RES_TYPES.error:
      let passed = test.expect(res);
      let output = (test.expect(res) ? 'PASSED: ' : '\nFAILED: ') + 
                   test.desc;
      console.log(output);
      if (!passed)
        console.log("output:", res, '\n');
      break;
  }
}

/////////////////// EXPORTS /////////////////////

module.exports = {
  httpReq,
  wsReq,
  showResponse,
  testResponse
};
