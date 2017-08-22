// for testing individual clone requests during development

//////////////////// IMPORTS //////////////////////

require('module-alias/register');

const config = require('@config'),
      gitCreds = require('@creds/git'),
      { httpReq, wsReq } = require('./clocRequests')
      argv = require('minimist')(process.argv);

////////////////// TEST REPOS /////////////////////

const TEST_REPOS = [{
  owner: 'code-flower',
  name:  'client-web',
  branch: ''
},{
  owner: '',
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
},{
  owner: 'jmensch1',
  name:  'sutter-quiz',
  branch: 'releases/1.0',
  username: gitCreds.username,
  password: gitCreds.password
},{
  owner: 'tensorflow',
  name: 'tensorflow',
  branch: ''
}];

/////////////////// FUNCTIONS /////////////////////

function handleResponse(res) {
  switch(res.type) {
    case config.responseTypes.update:
      console.log(res.data.text);
      break;
    case config.responseTypes.success:
      console.log("\nSUCCESS: ");
      console.log(res.data);
      break;
    case config.responseTypes.error:
      console.log("\nERROR: ");
      console.log(res.data);
      break;
  }
}

///////////////////// MAIN ////////////////////////

let reqFunc = argv.http ? httpReq : wsReq,
    testNum = argv.n || 0;

reqFunc(TEST_REPOS[testNum], handleResponse);



