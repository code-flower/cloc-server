// tests two errors that are hard to get at within the normal test framework:
// ParseError and EndpointNotFound

//////////////////// IMPORTS //////////////////////

require('module-alias/register');

const config = require('@config'),
      WebSocket = require('ws'),
      https = require('https'),
      { testResponse } = require('./_common'),
      argv = require('minimist')(process.argv);

/////////////////// CONSTANTS /////////////////////

// server config
const HOSTNAME = argv.remote ? 'api.codeflower.la' : 'localhost',
      PORT     = argv.remote ? 443 : 8000; 

const RES_TYPES = config.responseTypes,
      ERRORS    = config.errors;

/////////////////// FUNCTIONS /////////////////////

function wsReq(query, callback) {
  const ws = new WebSocket(`wss://${HOSTNAME}:${PORT}`, {
    rejectUnauthorized: false
  });
   
  ws.on('open', function() {
    ws.send(query);
  });
   
  ws.on('message', msg => callback(JSON.parse(msg)));
}

function httpReq(query, callback) {
  let opts = {
    method: 'POST',
    protocol: 'https:',
    hostname: HOSTNAME,
    port: PORT,
    path: `/${query.endpoint}`,
    rejectUnauthorized: false
  };

  let req = https.request(opts, res => {
    let body = '';
    res.on('data', data => body += data);
    res.on('end', () => callback(JSON.parse(body)));
  });

  req.write(query.params);
  req.end();
}

//////////////////// TESTS //////////////////////

const WS_TESTS = [{
  query: 'asdf',
  test: {
    desc: 'Valid endpoint, invalid JSON.',
    expect: res => res.type === RES_TYPES.error &&
                   res.data.name === ERRORS.ParseError.name
  }
},{
  query: JSON.stringify({
    endpoint: 'cow',
    params: {
      owner: 'code-flower',
      name: 'client-web',
      branch: ''
    }
  }),
  test: {
    desc: 'Invalid endpoint.',
    expect: res => res.type === RES_TYPES.error &&
                   res.data.name === ERRORS.EndpointNotRecognized.name
  }
}];

const HTTP_TESTS = [{
  query: {
    endpoint: 'cloc',
    params: 'asdf'
  },
  test: {
    desc: 'Valid endpoint, invalid JSON.',
    expect: res => res.type === RES_TYPES.error &&
                   res.data.name === ERRORS.ParseError.name
  }
},{
  query: {
    endpoint: 'cow',
    params: JSON.stringify({
      owner: 'code-flower',
      name: 'client-web',
      branch: ''
    })
  },
  test: {
    desc: 'Invalid endpoint.',
    expect: res => res.type === RES_TYPES.error &&
                   res.data.name === ERRORS.EndpointNotRecognized.name
  }
}];

/////////////////// MAIN /////////////////////

if (argv.http) {

  HTTP_TESTS.forEach(req => {
    httpReq(req.query, res => {
      testResponse(req.test, res);
    });
  });

} else {

  WS_TESTS.forEach(req => {
    wsReq(req.query, res => {
      testResponse(req.test, res);
    });
  });

}





