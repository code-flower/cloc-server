// for testing individual clone requests during development

//////////////////// IMPORTS //////////////////////

const WebSocket = require('ws');
const config = require('../config');

//////////////////// CONFIG ///////////////////////

// server config
const HOSTNAME      = 'localhost',
      PORT          = 8000,
      WS_PROTOCOL   = 'wss';

const TEST_REPOS = [{
  owner: 'code-flower',
  name:  'client-web',
  branch: 'masters'
},{
  owner: 'code-flower',
  name:  'client-web',
  branch: 'new-ui'
},{
  owner: 'addgatsby',
  name:  'gatsby-api',
  branch: ''
},{
  owner: 'Unitech',
  name:  'pm2',
  branch: ''
},{
  owner: 'jmensch1',
  name:  'sutter-quiz',
  branch: 'releases/1.0',
  username: '',
  password: ''
}];

/////////////////// FUNCTIONS /////////////////////

function testRepo(repo) {
  const ws = new WebSocket(`${WS_PROTOCOL}://${HOSTNAME}:${PORT}`, {
    rejectUnauthorized: false
  });
   
  ws.on('open', function() {
    console.log("TESTING: ", repo);
    ws.send(JSON.stringify({
      type: 'clone',
      data: repo
    }));
  });
   
  ws.on('message', function(msg) {
    msg = JSON.parse(msg);
    switch(msg.type) {
      case config.messageTypes.update:
        console.log(msg.data.text);
        break;
      case config.messageTypes.success:
        console.log("SUCCESS:", msg.data);
        break;
      case config.messageTypes.error:
        console.log("ERROR:", msg.data);
        break;
    }
  });

  ws.on('close', function() {
    console.log("CONNECTION CLOSED");
  });
}

////////////////////// RUN TEST ///////////////////////

testRepo(TEST_REPOS[1]);
