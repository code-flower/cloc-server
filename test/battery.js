// this is for testing all of the various params/responses for clone requests.

//////////////////// IMPORTS //////////////////////

const WebSocket = require('ws');
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
                   msg.data.errorType === ERR_TYPES.invalidCredentials
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

function runTest(repo) {
  const ws = new WebSocket(`${WS_PROTOCOL}://${HOSTNAME}:${PORT}`, {
    rejectUnauthorized: false
  });
   
  ws.on('open', function() {
    //console.log("TESTING: ", repo.name);
    ws.send(JSON.stringify({
      type: 'clone',
      repo: repo.params
    }));
  });
   
  ws.on('message', function(msg) {
    msg = JSON.parse(msg);
    switch(msg.type) {
      case 'text':
        //console.log(msg.text);
        break;
      default:
        let output = (repo.test.expect(msg) ? 'PASSED: ' : 'FAILED: ') + 
                     repo.test.desc;
        console.log(output)
        break;
    }
  });

  ws.on('close', function() {
    console.log("CLOSED");
  });
}

////////////////////// RUN TEST ///////////////////////

TESTS.forEach(runTest);
