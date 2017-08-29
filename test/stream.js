// maintain a constant number of connections with the server

//////////////////// IMPORTS //////////////////////

require('module-alias/register');

const config = require('@config'),
      gitCreds = require(config.paths.creds.git),
      { httpReq, wsReq, showResponse, showError } = require('./_common'),
      argv = require('minimist')(process.argv);

////////////////// TEST REPOS /////////////////////

const TEST = {
  endpoint: 'cloc',
  params: {
    owner:  'code-flower',
    name:   'pm2',
    branch: ''
  }
};

///////////////////// MAIN //////////////////////////

let reqFunc = argv.http ? httpReq : wsReq,
    connTarget = argv.n || 3,
    interval = argv.i || 1000;

let activeConns = 0;

setInterval(() => {

  console.log("active connections:", activeConns);

  if (activeConns < connTarget) {
    activeConns++;
    reqFunc({ request: TEST })
      .then(res => activeConns--)
      .catch(err => {
        console.log("ERROR:", err.code);
        activeConns--;
      });
  }

}, interval);




