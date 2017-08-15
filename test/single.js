// for testing individual clone requests during development

//////////////////// IMPORTS //////////////////////

const WebSocket = require('ws');
const config = require('../config');
const https = require('https');

//////////////////// CONFIG ///////////////////////

// server config
const HOSTNAME      = 'localhost',
      PORT          = 8000,
      WS_PROTOCOL   = 'wss',
      HTTP_PROTOCOL = 'https';

const TEST_REPOS = [{
  owner: '',
  name:  'client-web',
  branch: 'masters'
},{
  owner: 'code-flower',
  name:  'client-web',
  branch: 'master'
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

function httpTestRepo(repo) {
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
    res.on('end', () => {
      body = JSON.parse(body);
      console.log(body);
    });
  });

  req.write(JSON.stringify(repo));
  req.end();
}


////////////////////// RUN TEST ///////////////////////

// testRepo(TEST_REPOS[1]);

httpTestRepo(TEST_REPOS[1]);
