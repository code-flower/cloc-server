// tests two errors that are hard to get at within the normal test framework:
// ParseError and EndpointNotFound

//////////////////// IMPORTS //////////////////////

require('module-alias/register');

const WebSocket = require('ws'),
      https = require('https'),
      config = require('@config'),
      argv = require('minimist')(process.argv);

/////////////////// CONSTANTS /////////////////////

// server config
const HOSTNAME      = argv.remote ? 'api.codeflower.la' : 'localhost',
      HTTP_PROTOCOL = config.protocols.HTTP,
      HTTP_PORT     = config.ports.HTTP,
      WS_PROTOCOL   = config.protocols.WS,
      WS_PORT       = config.ports.WS,
      CLOC_ENDPOINT = config.endpoints.cloc; 

const RES_TYPES = config.responseTypes;
const ERRORS = config.errors;

/////////////////// FUNCTIONS /////////////////////

function wsReq(query, callback) {
  const ws = new WebSocket(`${WS_PROTOCOL}://${HOSTNAME}:${WS_PORT}`, {
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
    protocol: `${HTTP_PROTOCOL}:`,
    url: HOSTNAME,
    port: HTTP_PORT,
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

function evalResponse(test, res) {
  switch(res.type) {
    case RES_TYPES.update:
      //console.log(res.data.text);
      break;
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

  // console.log("HTTP Tests");
  HTTP_TESTS.forEach(req => {
    httpReq(req.query, res => {
      evalResponse(req.test, res);
    });
  });

} else {

  // console.log("WS Tests");
  WS_TESTS.forEach(req => {
    wsReq(req.query, res => {
      evalResponse(req.test, res);
    });
  });

}





