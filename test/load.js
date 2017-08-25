// for pounding the server

//////////////////// IMPORTS //////////////////////

require('module-alias/register');

const config = require('@config'),
      gitCreds = require(config.creds.git),
      { httpReq, wsReq, showResponse } = require('./_common'),
      argv = require('minimist')(process.argv);

////////////////// TEST REPOS /////////////////////

const TEST_REPOS = [{
  owner: 'code-flower',
  name:  'client-web',
  branch: ''
},{
  owner: 'code-flower',
  name:  'client-web',
  branch: 'new-ui'
},{
  owner: 'Unitech',
  name:  'pm2',
  branch: ''
},{
  owner: 'jmensch1',
  name:  'sutter-quiz',
  branch: 'releases/1.0',
  username: gitCreds.username,
  password: gitCreds.password
}];

///////////////////// MAIN //////////////////////////

let iterations = argv.iter || 10,
    testNum = argv.n || 0,
    reqFunc = argv.http ? httpReq : wsReq;

for (var i = 0; i < iterations; i++)
  reqFunc(TEST_REPOS[testNum], showResponse);

