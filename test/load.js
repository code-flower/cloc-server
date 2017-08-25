// for pounding the server

//////////////////// IMPORTS //////////////////////

require('module-alias/register');

const config = require('@config'),
      gitCreds = require(config.creds.git),
      { httpReq, wsReq } = require('./clocRequests'),
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

/////////////////// FUNCTIONS ///////////////////////

function handleResponse(res) {
  switch(res.type) {
    case config.responseTypes.update:
      //console.log(res.data.text);
      break;
    case config.responseTypes.success:
      console.log("SUCCESS: " + res.data.fNameBr);
      break;
    case config.responseTypes.error:
      console.log("ERROR: ", res.data.fNameBr);
      break;
  }
}

///////////////////// MAIN //////////////////////////

let iterations = argv.iter || 10,
    testNum = argv.n || 0,
    reqFunc = argv.http ? httpReq : wsReq;

for (var i = 0; i < iterations; i++)
  reqFunc(TEST_REPOS[testNum], handleResponse);

