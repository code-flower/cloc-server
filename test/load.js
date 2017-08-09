// for load-testing the server by simulating multiple simultaneous
// clone requests. The repos to be cloned are listed in the TEST_REPOS
// constant below. 

//////////////////// IMPORTS //////////////////////

const WebSocket = require('ws');
const http = require('http');
const https = require('https');

//////////////////// CONFIG ///////////////////////

// server config
const HOSTNAME      = 'localhost',
      PORT          = 8000,
      WS_PROTOCOL   = 'wss',
      HTTP_PROTOCOL = 'https',
      HARVEST_URL   = '/harvest';

// the repos to clone
const TEST_REPOS = [
  'https://github.com/code-flower/client-web.git',
  'https://github.com/code-flower/server.git'
];

/////////////////// FUNCTIONS /////////////////////

function harvestRepo(repoName) {

  var httpModule = HTTP_PROTOCOL === 'https' ? https : http;

  var opts = {
    hostname: HOSTNAME,
    port: PORT,
    path: `${HARVEST_URL}?repo=${encodeURIComponent(repoName)}`,
    method: 'GET',
    rejectUnauthorized: false
  };

  httpModule.get(opts, function(res) {
    if (res.statusCode != 200) {
      console.log('repo not found');
      return false;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log('COMPLETE: ' + repoName);
    });
  });
}

function testRepo(cloneUrl) {
  console.log("TESTING: " + cloneUrl);

  const ws = new WebSocket(`${WS_PROTOCOL}://${HOSTNAME}:${PORT}`, {
    rejectUnauthorized: false
  });
   
  ws.on('open', function open() {
    ws.send(JSON.stringify({
      type: 'clone',
      repo: {
        url: cloneUrl
      }
    }));
  });
   
  ws.on('message', function incoming(data) {
    data = JSON.parse(data);
    switch (data.type) {
      case 'complete':
        harvestRepo(data.repoName);
        break;
    }
  });
}

////////////////////// RUN TEST ///////////////////////

TEST_REPOS.forEach(testRepo);
