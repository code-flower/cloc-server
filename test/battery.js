// this is for testing all of the various params/responses for clone requests.

//////////////////// IMPORTS //////////////////////

const WebSocket = require('ws');
const https = require('https');
const config = require('../config');
const gitCreds = require('../private/git-creds');

/////////////////// CONSTANTS /////////////////////

// server config
const HOSTNAME      = 'localhost',
      PORT          = 8000,
      WS_PROTOCOL   = 'wss';

const MSG_TYPES = config.messageTypes,
      ERR_TYPES = config.errorTypes;

///////////////// TEST REQUESTS ///////////////////

const TESTS = [{
  params: {
    owner: 'code-flower',
    name: '',
    branch: 'master'
  },
  test: {
    desc: 'Repo name not provided.',
    expect: msg => msg.type === MSG_TYPES.error &&
                   msg.data.errorType === ERR_TYPES.needOwnerAndName
  }
},{
  params: {
    owner: 'code-flower',
    name: 'client-web',
    branch: 'masters'
  },
  test: {
    desc: 'Public repo, non-existent branch provided, no creds.',
    expect: msg => msg.type === MSG_TYPES.error &&
                   msg.data.errorType === ERR_TYPES.branchNotFound
  }
},{
  params: {
    owner:  'code-flower',
    name:   'client-web',
    branch: 'new-ui'
  },
  test: {
    desc: 'Public repo, branch valid, no creds.',
    expect: msg => msg.type === MSG_TYPES.success &&
                   msg.data.fullName === 'code-flower/client-web'
  }
},{
  params: {
    owner:  'addgatsby',
    name:   'gatsby-api',
    branch: ''
  },
  test: {
    desc: 'Private repo, no branch specified, no creds.',
    expect: msg => msg.type === MSG_TYPES.error &&
                   msg.data.errorType === ERR_TYPES.needCredentials
  }
},{
  params: {
    owner: 'Unitech',
    name:  'pm2',
    branch: '',
    username: 'whatthe',
    password: 'hell'
  },
  test: {
    desc: 'Public repo, no branch specified, dummy creds provided.',
    expect: msg => msg.type === MSG_TYPES.success &&
                   msg.data.branch === ''
  }
},{
  params: {
    owner: 'jmensch1',
    name:  'sutter-quiz',
    branch: 'releases/1.0',
    username: 'wrong',
    password: 'credentials'
  },
  test: {
    desc: 'Private repo, valid branch specified, invalid credentials provided.',
    expect: msg => msg.type === MSG_TYPES.error &&
                   msg.data.errorType === ERR_TYPES.credentialsInvalid
  }
},{
  params: {
    owner: 'jmensch1',
    name:  'sutter-quiz',
    branch: 'releases/1.0',
    username: gitCreds.username,
    password: gitCreds.password
  },
  test: {
    desc: 'Private repo, valid branch specified, valid credentials provided.',
    expect: msg => msg.type === MSG_TYPES.success &&
                   msg.data.fullName === 'jmensch1/sutter-quiz' &&
                   msg.data.branch === 'releases/1.0'
  }
}];

/////////////////// FUNCTIONS /////////////////////

function evalResponse(repo, res) {
  res = JSON.parse(res);
  switch(res.type) {
    case config.messageTypes.update:
      //console.log(res.data.text);
      break;
    default:
      let passed = repo.test.expect(res);
      let output = (repo.test.expect(res) ? 'PASSED: ' : '\nFAILED: ') + 
                   repo.test.desc;
      console.log(output);
      if (!passed)
        console.log("output:", res, '\n');
      break;
  }
}

function runWSTest(repo) {
  const ws = new WebSocket(`${WS_PROTOCOL}://${HOSTNAME}:${PORT}`, {
    rejectUnauthorized: false
  });
   
  ws.on('open', function() {
    ws.send(JSON.stringify({
      type: 'clone',
      data: repo.params
    }));
  });
   
  ws.on('message', msg => evalResponse(repo, msg));

  ws.on('close', function() {
    //console.log("CLOSED");
  });
}

function runHTTPTest(repo) {
  let opts = {
    url: HOSTNAME,
    path: '/clone',
    method: 'POST',
    port: PORT,
    rejectUnauthorized: false
  };

  let req = https.request(opts, res => {
    let body = '';
    res.on('data', data => body += data);
    res.on('end', () => evalResponse(repo, body));
  });

  req.write(JSON.stringify(repo.params));
  req.end();
}

////////////////////// RUN TEST ///////////////////////

TESTS.forEach(runWSTest);
//TESTS.forEach(runHTTPTest);
